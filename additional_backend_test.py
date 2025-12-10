#!/usr/bin/env python3
"""
Additional Backend API Tests for Cigar Ranker App
Tests other core endpoints beyond authentication
"""

import requests
import json
import time
from datetime import datetime

BACKEND_URL = "https://puff-tracker-2.preview.emergentagent.com/api"

def test_cigar_search():
    """Test cigar search endpoint"""
    try:
        response = requests.get(f"{BACKEND_URL}/cigars/search", timeout=10)
        if response.status_code == 200:
            data = response.json()
            if isinstance(data, list) and len(data) > 0:
                print("✅ Cigar Search: Working - Found cigars in database")
                return True
            else:
                print("❌ Cigar Search: No cigars found in database")
                return False
        else:
            print(f"❌ Cigar Search: HTTP {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Cigar Search: Error - {str(e)}")
        return False

def test_cigar_search_with_query():
    """Test cigar search with query parameter"""
    try:
        response = requests.get(f"{BACKEND_URL}/cigars/search?q=Montecristo", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Cigar Search with Query: Working - Found {len(data)} results")
            return True
        else:
            print(f"❌ Cigar Search with Query: HTTP {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Cigar Search with Query: Error - {str(e)}")
        return False

def test_barcode_scan():
    """Test barcode scanning endpoint"""
    try:
        test_data = {"barcode": "123456789012"}
        response = requests.post(f"{BACKEND_URL}/cigars/scan-barcode", json=test_data, timeout=10)
        if response.status_code == 200:
            data = response.json()
            print("✅ Barcode Scan: Working - Endpoint responds correctly")
            return True
        else:
            print(f"❌ Barcode Scan: HTTP {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Barcode Scan: Error - {str(e)}")
        return False

def test_store_prices():
    """Test store prices endpoint"""
    try:
        # First get a cigar ID
        search_response = requests.get(f"{BACKEND_URL}/cigars/search", timeout=10)
        if search_response.status_code == 200:
            cigars = search_response.json()
            if cigars:
                cigar_id = cigars[0]["id"]
                response = requests.get(f"{BACKEND_URL}/stores/{cigar_id}", timeout=10)
                if response.status_code == 200:
                    data = response.json()
                    if isinstance(data, list) and len(data) > 0:
                        print("✅ Store Prices: Working - Returns price data")
                        return True
                    else:
                        print("❌ Store Prices: No price data returned")
                        return False
                else:
                    print(f"❌ Store Prices: HTTP {response.status_code}")
                    return False
            else:
                print("❌ Store Prices: No cigars available for testing")
                return False
        else:
            print("❌ Store Prices: Cannot get cigar for testing")
            return False
    except Exception as e:
        print(f"❌ Store Prices: Error - {str(e)}")
        return False

def main():
    """Run additional backend tests"""
    print("=" * 50)
    print("ADDITIONAL BACKEND API TESTS")
    print("=" * 50)
    
    tests = [
        test_cigar_search,
        test_cigar_search_with_query,
        test_barcode_scan,
        test_store_prices
    ]
    
    passed = 0
    for test in tests:
        if test():
            passed += 1
    
    print(f"\nAdditional Tests: {passed}/{len(tests)} passed")
    return passed == len(tests)

if __name__ == "__main__":
    main()