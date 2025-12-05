# Generate 1000+ cigars with realistic variations
from datetime import datetime
import random

# Use placeholder image for generated cigars
PLACEHOLDER_IMAGE = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

# Define cigar attributes for generation
BRANDS = [
    "Montecristo", "Cohiba", "Padron", "Arturo Fuente", "Drew Estate", "Oliva", 
    "My Father", "Romeo y Julieta", "Partagas", "Hoyo de Monterrey", "Davidoff",
    "Ashton", "La Flor Dominicana", "Camacho", "Alec Bradley", "Rocky Patel",
    "Macanudo", "Perdomo", "CAO", "Nub", "Tatuaje", "Illusione", "Foundation",
    "Punch", "5 Vegas", "Gran Habano", "Avo", "Kristoff", "San Cristobal",
    "E.P. Carrillo", "Warped", "RoMa Craft", "Crowned Heads", "Diesel",
    "Aging Room", "Liga", "Man O' War", "Gurkha", "Acid", "Tabak Especial",
    "Undercrown", "Herrera Esteli", "La Aroma de Cuba", "Don Pepin Garcia",
    "Jaime Garcia", "El Titan de Bronze", "Plasencia", "AJ Fernandez",
    "Eiroa", "Aladino", "Dunbarton", "Mbombay", "Quesada", "Casa Magna",
    "Espinosa", "601", "La Palina", "CLE", "Alec & Bradley", "Nestor Miranda"
]

ORIGINS = ["Cuba", "Nicaragua", "Dominican Republic", "Honduras", "Ecuador", "Mexico", "Brazil", "Costa Rica", "Peru"]

WRAPPERS = [
    "Habano", "Maduro", "Connecticut Shade", "Connecticut Broadleaf", 
    "Ecuadorian Sun Grown", "Cameroon", "Corojo", "Oscuro", "Candela",
    "Brazilian Maduro", "Indonesian", "Mexican San Andres", "Sumatra",
    "Dominican Sun Grown", "Nicaraguan Sun Grown", "Criollo"
]

STRENGTHS = ["Mild", "Mild-Medium", "Medium", "Medium-Full", "Full"]

SIZES = [
    "Robusto (5 x 50)", "Toro (6 x 50)", "Churchill (7 x 48)", 
    "Corona (5.5 x 42)", "Petit Corona (4.5 x 42)", "Torpedo (6 x 52)",
    "Gordo (6 x 60)", "Perfecto (5.5 x 54)", "Lancero (7 x 38)",
    "Double Corona (7.5 x 50)", "Panatela (6 x 34)", "Lonsdale (6.5 x 42)",
    "Belicoso (5.5 x 52)", "Pyramid (6 x 52)", "Gran Corona (6.5 x 46)",
    "Short Robusto (4.5 x 50)", "Salomon (7 x 57)", "Figurado (6 x 54)"
]

FLAVOR_GROUPS = [
    ["Coffee", "Chocolate", "Cream"],
    ["Cedar", "Leather", "Earth"],
    ["Pepper", "Spice", "Nuts"],
    ["Cocoa", "Coffee", "Espresso"],
    ["Honey", "Vanilla", "Toast"],
    ["Wood", "Cedar", "Tobacco"],
    ["Earth", "Leather", "Coffee"],
    ["Cream", "Nuts", "Caramel"],
    ["Spice", "Cinnamon", "Clove"],
    ["Cherry", "Plum", "Dried Fruit"],
    ["Almond", "Hazelnut", "Walnut"],
    ["Floral", "Herb", "Tea"],
    ["Cocoa", "Dark Chocolate", "Mocha"],
    ["Toast", "Bread", "Grain"],
    ["Caramel", "Toffee", "Butterscotch"]
]

SERIES = [
    "Reserve", "Limited Edition", "Vintage", "Anniversary", "Classic", "Premium",
    "Selection", "Signature", "Private Reserve", "Special Edition", "Grand Reserve",
    "Master Blend", "Collector's Edition", "Heritage", "Legacy", "Tradition",
    "Excellence", "Prestige", "Imperial", "Royal", "Supreme", "Elite",
    "Original", "Reserva", "Especial", "Connecticut", "Maduro", "Natural"
]

PRICE_RANGES = [
    "4-6", "5-8", "6-9", "7-10", "8-11", "9-12", "10-13", "11-14", 
    "12-16", "15-20", "18-23", "20-25", "25-30", "30-40", "40-50", "50-75"
]

def generate_cigars(count=1000):
    """Generate realistic cigar data"""
    cigars = []
    
    for i in range(count):
        brand = random.choice(BRANDS)
        series = random.choice(SERIES)
        size_name = random.choice(SIZES)
        strength = random.choice(STRENGTHS)
        origin = random.choice(ORIGINS)
        wrapper = random.choice(WRAPPERS)
        
        # Generate name
        if random.random() > 0.3:
            name = f"{brand} {series}"
        else:
            name = f"{brand} {series} {size_name.split('(')[0].strip()}"
        
        # Select appropriate wrapper and binder based on origin
        if origin == "Cuba":
            binder = "Cuban"
            filler = "Cuban"
            wrapper_final = "Habano"
        elif origin == "Nicaragua":
            binder = "Nicaraguan"
            filler = "Nicaraguan"
            wrapper_final = wrapper
        elif origin == "Dominican Republic":
            binder = "Dominican"
            filler = "Dominican"
            wrapper_final = wrapper
        elif origin == "Honduras":
            binder = "Honduran"
            filler = "Honduran/Nicaraguan"
            wrapper_final = wrapper
        else:
            binder = f"{origin}"
            filler = f"{origin}"
            wrapper_final = wrapper
        
        # Generate rating based on strength and price
        price_range = random.choice(PRICE_RANGES)
        avg_price = sum(map(float, price_range.split('-'))) / 2
        
        # Higher prices generally correlate with higher ratings
        if avg_price > 30:
            base_rating = random.uniform(8.8, 9.8)
        elif avg_price > 15:
            base_rating = random.uniform(8.3, 9.3)
        elif avg_price > 8:
            base_rating = random.uniform(7.8, 8.8)
        else:
            base_rating = random.uniform(7.3, 8.3)
        
        # Generate barcode
        barcode = f"750105530{i+500:04d}"
        
        cigar = {
            "name": name,
            "brand": brand,
            "image": PLACEHOLDER_IMAGE,
            "images": [],
            "strength": strength,
            "flavor_notes": random.choice(FLAVOR_GROUPS),
            "origin": origin,
            "wrapper": wrapper_final,
            "binder": binder,
            "filler": filler,
            "size": size_name,
            "price_range": price_range,
            "barcode": barcode,
            "average_rating": round(base_rating, 1),
            "rating_count": 0,
            "created_at": datetime.utcnow()
        }
        
        cigars.append(cigar)
    
    return cigars

def get_generated_cigars():
    """Get 1000 generated cigars"""
    return generate_cigars(1000)
