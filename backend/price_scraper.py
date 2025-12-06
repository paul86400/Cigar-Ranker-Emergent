import aiohttp
import asyncio
from bs4 import BeautifulSoup
from typing import List, Dict, Optional
import urllib.parse
import re

class PriceScraper:
    """
    Scrapes cigar prices from various retailers.
    Note: Web scraping can be fragile and may break if sites change their HTML structure.
    """
    
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    
    async def fetch_page(self, session: aiohttp.ClientSession, url: str) -> Optional[str]:
        """Fetch a page with error handling"""
        try:
            async with session.get(url, headers=self.headers, timeout=10) as response:
                if response.status == 200:
                    return await response.text()
        except Exception as e:
            print(f"Error fetching {url}: {e}")
        return None
    
    def extract_price(self, text: str) -> Optional[float]:
        """Extract price from text"""
        # Look for price patterns like $12.99, 12.99, etc.
        price_patterns = [
            r'\$(\d+\.\d{2})',
            r'(\d+\.\d{2})',
        ]
        for pattern in price_patterns:
            match = re.search(pattern, text)
            if match:
                try:
                    return float(match.group(1))
                except:
                    continue
        return None
    
    async def search_cigars_international(self, session: aiohttp.ClientSession, cigar_name: str, brand: str) -> Dict:
        """
        Search Cigars International for a specific cigar.
        Returns direct product URL if found, otherwise search URL.
        """
        search_query = f"{brand} {cigar_name}"
        search_url = f"https://www.cigarsinternational.com/search/?q={urllib.parse.quote(search_query)}"
        
        html = await self.fetch_page(session, search_url)
        if not html:
            return {
                "store_name": "Cigars International",
                "price": None,
                "url": search_url,
                "in_stock": False,
                "product_url": None
            }
        
        soup = BeautifulSoup(html, 'html.parser')
        
        # Try to find first product in search results
        product_link = soup.select_one('a.product-item-link, .product-tile a, a[href*="/p/"]')
        product_price = soup.select_one('.price, .product-price, [class*="price"]')
        
        product_url = None
        price = None
        in_stock = False
        
        if product_link:
            href = product_link.get('href', '')
            if href.startswith('/'):
                product_url = f"https://www.cigarsinternational.com{href}"
            elif href.startswith('http'):
                product_url = href
            else:
                product_url = f"https://www.cigarsinternational.com/{href}"
            
            # Check if product is in stock
            in_stock = True  # Assume in stock if we found a product
        
        if product_price:
            price_text = product_price.get_text(strip=True)
            price = self.extract_price(price_text)
        
        return {
            "store_name": "Cigars International",
            "price": price,
            "url": product_url if product_url else search_url,
            "in_stock": in_stock and price is not None,
            "product_url": product_url
        }
    
    async def search_neptune_cigar(self, session: aiohttp.ClientSession, cigar_name: str, brand: str) -> Dict:
        """Search Neptune Cigar"""
        search_query = f"{brand} {cigar_name}"
        search_url = f"https://www.neptunecigar.com/search?q={urllib.parse.quote(search_query)}"
        
        html = await self.fetch_page(session, search_url)
        if not html:
            return {
                "store_name": "Neptune Cigar",
                "price": None,
                "url": search_url,
                "in_stock": False,
                "product_url": None
            }
        
        soup = BeautifulSoup(html, 'html.parser')
        
        # Try to find first product
        product_link = soup.select_one('a.product-link, .product-item a, a[href*="/products/"]')
        product_price = soup.select_one('.price, .product-price')
        
        product_url = None
        price = None
        in_stock = False
        
        if product_link:
            href = product_link.get('href', '')
            if href.startswith('/'):
                product_url = f"https://www.neptunecigar.com{href}"
            elif href.startswith('http'):
                product_url = href
            
            in_stock = True
        
        if product_price:
            price_text = product_price.get_text(strip=True)
            price = self.extract_price(price_text)
        
        return {
            "store_name": "Neptune Cigar",
            "price": price,
            "url": product_url if product_url else search_url,
            "in_stock": in_stock and price is not None,
            "product_url": product_url
        }
    
    async def search_atlantic_cigar(self, session: aiohttp.ClientSession, cigar_name: str, brand: str) -> Dict:
        """Search Atlantic Cigar"""
        search_query = f"{brand} {cigar_name}"
        search_url = f"https://www.atlanticcigar.com/search.asp?keyword={urllib.parse.quote(search_query)}"
        
        html = await self.fetch_page(session, search_url)
        if not html:
            return {
                "store_name": "Atlantic Cigar",
                "price": None,
                "url": search_url,
                "in_stock": False,
                "product_url": None
            }
        
        soup = BeautifulSoup(html, 'html.parser')
        
        # Try to find first product
        product_link = soup.select_one('a.product-link, .productlist a, a[href*="product"]')
        product_price = soup.select_one('.price, .productprice')
        
        product_url = None
        price = None
        in_stock = False
        
        if product_link:
            href = product_link.get('href', '')
            if href.startswith('/'):
                product_url = f"https://www.atlanticcigar.com{href}"
            elif href.startswith('http'):
                product_url = href
            
            in_stock = True
        
        if product_price:
            price_text = product_price.get_text(strip=True)
            price = self.extract_price(price_text)
        
        return {
            "store_name": "Atlantic Cigar",
            "price": price,
            "url": product_url if product_url else search_url,
            "in_stock": in_stock and price is not None,
            "product_url": product_url
        }
    
    async def get_all_prices(self, cigar_name: str, brand: str) -> List[Dict]:
        """Get prices from all retailers concurrently"""
        async with aiohttp.ClientSession() as session:
            tasks = [
                self.search_cigars_international(session, cigar_name, brand),
                self.search_neptune_cigar(session, cigar_name, brand),
                self.search_atlantic_cigar(session, cigar_name, brand),
            ]
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Filter out exceptions and return valid results
            stores = []
            for result in results:
                if isinstance(result, dict):
                    stores.append(result)
                elif isinstance(result, Exception):
                    print(f"Error in scraping: {result}")
            
            return stores
