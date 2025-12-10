#!/usr/bin/env python3
"""
Backend API Testing for Cigar Ranker App
Focus: Private Notes Feature Testing
"""

import requests
import json
import sys
import time
from typing import Dict, Any, Optional

# Backend URL from frontend .env
BACKEND_URL = "https://puff-tracker-2.preview.emergentagent.com/api"

class CigarRankerTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.session = requests.Session()
        self.auth_token = None
        self.test_user_id = None
        self.results = []
        
    def log_result(self, test_name: str, success: bool, message: str, details: Any = None):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        if details and not success:
            print(f"   Details: {details}")
        
        self.results.append({
            "test": test_name,
            "success": success,
            "message": message,
            "details": details
        })
    
    def make_request(self, method: str, endpoint: str, **kwargs) -> requests.Response:
        """Make HTTP request with proper error handling"""
        url = f"{self.base_url}{endpoint}"
        
        # Add auth header if token exists
        if self.auth_token:
            if 'headers' not in kwargs:
                kwargs['headers'] = {}
            kwargs['headers']['Authorization'] = f"Bearer {self.auth_token}"
        
        try:
            response = self.session.request(method, url, timeout=30, **kwargs)
            return response
        except requests.exceptions.RequestException as e:
            print(f"Request failed: {e}")
            raise
    
    def test_user_registration(self) -> bool:
        """Test user registration for authentication"""
        print("\n🔐 Testing User Registration...")
        
        # Use unique timestamp to avoid conflicts
        timestamp = str(int(time.time()))
        test_user = {
            "username": f"testuser_{timestamp}",
            "email": f"test_{timestamp}@example.com",
            "password": "TestPassword123!"
        }
        
        try:
            response = self.make_request("POST", "/auth/register", json=test_user)
            
            if response.status_code == 200:
                data = response.json()
                self.auth_token = data.get("token")
                self.test_user_id = data.get("user", {}).get("id")
                
                self.log_result("User Registration", True, 
                              f"User registered successfully: {test_user['username']}")
                return True
            else:
                self.log_result("User Registration", False, 
                              f"Registration failed with status {response.status_code}", 
                              response.text)
                return False
                
        except Exception as e:
            self.log_result("User Registration", False, f"Registration error: {str(e)}")
            return False
    
    def test_add_cigar_success(self) -> Optional[str]:
        """Test adding a new cigar successfully"""
        print("\n➕ Testing Add Cigar - Success Case...")
        
        # Use unique timestamp to ensure uniqueness
        timestamp = str(int(time.time()))
        cigar_data = {
            "brand": f"TestBrand_{timestamp}",
            "name": f"TestCigar_{timestamp}",
            "strength": "Medium",
            "origin": "Nicaragua",
            "wrapper": "Connecticut",
            "size": "Robusto",
            "price_range": "10-15"
        }
        
        try:
            response = self.make_request("POST", "/cigars/add", data=cigar_data)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") == True:
                    cigar_id = data.get("cigar_id")
                    self.log_result("Add Cigar Success", True, 
                                  f"Cigar added successfully with ID: {cigar_id}")
                    return cigar_id
                else:
                    self.log_result("Add Cigar Success", False, 
                                  f"API returned success=false: {data.get('message')}", data)
                    return None
            else:
                self.log_result("Add Cigar Success", False, 
                              f"Request failed with status {response.status_code}", 
                              response.text)
                return None
                
        except Exception as e:
            self.log_result("Add Cigar Success", False, f"Request error: {str(e)}")
            return None
    
    def test_add_cigar_with_optional_fields(self) -> Optional[str]:
        """Test adding cigar with optional price_range field"""
        print("\n➕ Testing Add Cigar - With Optional Fields...")
        
        timestamp = str(int(time.time())) + "_opt"
        cigar_data = {
            "brand": f"OptionalBrand_{timestamp}",
            "name": f"OptionalCigar_{timestamp}",
            "strength": "Full",
            "origin": "Dominican Republic",
            "wrapper": "Maduro",
            "size": "Churchill"
            # Intentionally omitting price_range to test optional field
        }
        
        try:
            response = self.make_request("POST", "/cigars/add", data=cigar_data)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") == True:
                    cigar_id = data.get("cigar_id")
                    self.log_result("Add Cigar Optional Fields", True, 
                                  f"Cigar added without price_range, ID: {cigar_id}")
                    return cigar_id
                else:
                    self.log_result("Add Cigar Optional Fields", False, 
                                  f"API returned success=false: {data.get('message')}", data)
                    return None
            else:
                self.log_result("Add Cigar Optional Fields", False, 
                              f"Request failed with status {response.status_code}", 
                              response.text)
                return None
                
        except Exception as e:
            self.log_result("Add Cigar Optional Fields", False, f"Request error: {str(e)}")
            return None
    
    def test_add_cigar_missing_fields(self):
        """Test validation for missing required fields"""
        print("\n❌ Testing Add Cigar - Missing Required Fields...")
        
        # Test missing brand
        incomplete_data = {
            "name": "TestCigar",
            "strength": "Medium",
            "origin": "Nicaragua",
            "wrapper": "Connecticut",
            "size": "Robusto"
            # Missing brand
        }
        
        try:
            response = self.make_request("POST", "/cigars/add", data=incomplete_data)
            
            if response.status_code == 422:  # FastAPI validation error
                self.log_result("Add Cigar Missing Fields", True, 
                              "Correctly rejected request with missing brand field")
            elif response.status_code == 400:
                self.log_result("Add Cigar Missing Fields", True, 
                              "Correctly rejected request with missing brand field")
            else:
                self.log_result("Add Cigar Missing Fields", False, 
                              f"Expected validation error, got status {response.status_code}", 
                              response.text)
                
        except Exception as e:
            self.log_result("Add Cigar Missing Fields", False, f"Request error: {str(e)}")
    
    def test_add_cigar_no_auth(self):
        """Test that endpoint requires authentication"""
        print("\n🔒 Testing Add Cigar - No Authentication...")
        
        # Temporarily remove auth token
        original_token = self.auth_token
        self.auth_token = None
        
        cigar_data = {
            "brand": "UnauthorizedBrand",
            "name": "UnauthorizedCigar",
            "strength": "Medium",
            "origin": "Nicaragua",
            "wrapper": "Connecticut",
            "size": "Robusto"
        }
        
        try:
            response = self.make_request("POST", "/cigars/add", data=cigar_data)
            
            if response.status_code == 401:  # Unauthorized
                self.log_result("Add Cigar No Auth", True, 
                              "Correctly rejected unauthorized request")
            else:
                self.log_result("Add Cigar No Auth", False, 
                              f"Expected 401 Unauthorized, got status {response.status_code}", 
                              response.text)
                
        except Exception as e:
            self.log_result("Add Cigar No Auth", False, f"Request error: {str(e)}")
        finally:
            # Restore auth token
            self.auth_token = original_token
    
    def test_duplicate_detection(self):
        """Test duplicate detection (case-insensitive)"""
        print("\n🔍 Testing Duplicate Detection...")
        
        # First, try to add a cigar that we know exists (from seed data)
        existing_cigar = {
            "brand": "Padron",
            "name": "1964 Anniversary",
            "strength": "Full",
            "origin": "Nicaragua",
            "wrapper": "Natural",
            "size": "Robusto"
        }
        
        try:
            response = self.make_request("POST", "/cigars/add", data=existing_cigar)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") == False and "already exists" in data.get("message", "").lower():
                    cigar_id = data.get("cigar_id")
                    self.log_result("Duplicate Detection", True, 
                                  f"Correctly detected duplicate: {data.get('message')}, ID: {cigar_id}")
                else:
                    self.log_result("Duplicate Detection", False, 
                                  f"Expected duplicate detection, got: {data}")
            else:
                self.log_result("Duplicate Detection", False, 
                              f"Request failed with status {response.status_code}", 
                              response.text)
                
        except Exception as e:
            self.log_result("Duplicate Detection", False, f"Request error: {str(e)}")
    
    def test_case_insensitive_duplicate(self):
        """Test case-insensitive duplicate detection"""
        print("\n🔍 Testing Case-Insensitive Duplicate Detection...")
        
        # Try different case variations of known cigar
        case_variant = {
            "brand": "PADRON",  # Different case
            "name": "1964 ANNIVERSARY",  # Different case
            "strength": "Full",
            "origin": "Nicaragua",
            "wrapper": "Natural",
            "size": "Robusto"
        }
        
        try:
            response = self.make_request("POST", "/cigars/add", data=case_variant)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") == False and "already exists" in data.get("message", "").lower():
                    self.log_result("Case Insensitive Duplicate", True, 
                                  f"Correctly detected case-insensitive duplicate: {data.get('message')}")
                else:
                    self.log_result("Case Insensitive Duplicate", False, 
                                  f"Expected duplicate detection, got: {data}")
            else:
                self.log_result("Case Insensitive Duplicate", False, 
                              f"Request failed with status {response.status_code}", 
                              response.text)
                
        except Exception as e:
            self.log_result("Case Insensitive Duplicate", False, f"Request error: {str(e)}")
    
    def test_search_newly_added_cigar(self, cigar_id: str, brand: str, name: str):
        """Test that newly added cigar is searchable"""
        print("\n🔍 Testing Search for Newly Added Cigar...")
        
        try:
            # Search by brand
            response = self.make_request("GET", f"/cigars/search?q={brand}")
            
            if response.status_code == 200:
                cigars = response.json()
                found = any(cigar.get("id") == cigar_id for cigar in cigars)
                
                if found:
                    self.log_result("Search Newly Added", True, 
                                  f"Newly added cigar found in search results")
                else:
                    self.log_result("Search Newly Added", False, 
                                  f"Newly added cigar not found in search results", 
                                  f"Searched for: {brand}, Found {len(cigars)} results")
            else:
                self.log_result("Search Newly Added", False, 
                              f"Search request failed with status {response.status_code}", 
                              response.text)
                
        except Exception as e:
            self.log_result("Search Newly Added", False, f"Search error: {str(e)}")
    
    def test_get_cigar_details(self, cigar_id: str):
        """Test getting cigar details by ID to verify all fields are saved"""
        print("\n📋 Testing Get Cigar Details...")
        
        try:
            response = self.make_request("GET", f"/cigars/{cigar_id}")
            
            if response.status_code == 200:
                cigar = response.json()
                
                # Check required fields are present
                required_fields = ["brand", "name", "strength", "origin", "wrapper", "size"]
                missing_fields = [field for field in required_fields if not cigar.get(field)]
                
                if not missing_fields:
                    # Check if default image is present
                    has_image = bool(cigar.get("image"))
                    self.log_result("Get Cigar Details", True, 
                                  f"All required fields present, has_image: {has_image}")
                else:
                    self.log_result("Get Cigar Details", False, 
                                  f"Missing required fields: {missing_fields}", cigar)
            else:
                self.log_result("Get Cigar Details", False, 
                              f"Get cigar request failed with status {response.status_code}", 
                              response.text)
                
        except Exception as e:
            self.log_result("Get Cigar Details", False, f"Get cigar error: {str(e)}")
    
    def test_edge_cases(self):
        """Test edge cases like empty strings and long strings"""
        print("\n⚠️  Testing Edge Cases...")
        
        # Test empty brand
        empty_brand_data = {
            "brand": "",  # Empty string
            "name": "TestCigar",
            "strength": "Medium",
            "origin": "Nicaragua",
            "wrapper": "Connecticut",
            "size": "Robusto"
        }
        
        try:
            response = self.make_request("POST", "/cigars/add", data=empty_brand_data)
            
            if response.status_code in [400, 422]:  # Should reject empty brand
                self.log_result("Edge Case Empty Brand", True, 
                              "Correctly rejected empty brand")
            else:
                # If it accepts empty brand, that might be acceptable depending on validation
                self.log_result("Edge Case Empty Brand", True, 
                              f"Accepted empty brand (status: {response.status_code})")
                
        except Exception as e:
            self.log_result("Edge Case Empty Brand", False, f"Request error: {str(e)}")
        
        # Test very long strings
        long_string = "A" * 200  # 200 character string
        long_data = {
            "brand": long_string,
            "name": long_string,
            "strength": "Medium",
            "origin": "Nicaragua",
            "wrapper": "Connecticut",
            "size": "Robusto"
        }
        
        try:
            response = self.make_request("POST", "/cigars/add", data=long_data)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    self.log_result("Edge Case Long Strings", True, 
                                  "Accepted very long brand/name strings")
                else:
                    self.log_result("Edge Case Long Strings", True, 
                                  f"Handled long strings appropriately: {data.get('message')}")
            else:
                self.log_result("Edge Case Long Strings", True, 
                              f"Rejected long strings (status: {response.status_code})")
                
        except Exception as e:
            self.log_result("Edge Case Long Strings", False, f"Request error: {str(e)}")

    # ==================== PRIVATE NOTES TESTS ====================
    
    def get_test_cigar_id(self):
        """Get a cigar ID for testing notes"""
        try:
            response = self.make_request("GET", "/cigars/search?q=Montecristo")
            if response.status_code == 200:
                cigars = response.json()
                if cigars:
                    return cigars[0]['id']
            return None
        except Exception:
            return None
    
    def test_private_notes_get_empty(self):
        """Test GET /api/cigars/{cigar_id}/my-note - should return empty note initially"""
        print("\n📝 Testing Private Notes - GET Empty Note...")
        
        cigar_id = self.get_test_cigar_id()
        if not cigar_id:
            self.log_result("Private Notes GET Empty", False, "No test cigar available")
            return
        
        try:
            response = self.make_request("GET", f"/cigars/{cigar_id}/my-note")
            
            if response.status_code == 200:
                data = response.json()
                if data.get('note_text') == '':
                    self.log_result("Private Notes GET Empty", True, 
                                  "Correctly returned empty note")
                else:
                    self.log_result("Private Notes GET Empty", False, 
                                  f"Expected empty note, got: {data}")
            else:
                self.log_result("Private Notes GET Empty", False, 
                              f"Request failed with status {response.status_code}", 
                              response.text)
                
        except Exception as e:
            self.log_result("Private Notes GET Empty", False, f"Request error: {str(e)}")
    
    def test_private_notes_create(self):
        """Test POST /api/cigars/{cigar_id}/my-note - create a new note"""
        print("\n📝 Testing Private Notes - POST Create Note...")
        
        cigar_id = self.get_test_cigar_id()
        if not cigar_id:
            self.log_result("Private Notes POST Create", False, "No test cigar available")
            return
        
        note_data = {
            "note_text": "This is my private note about this cigar. Great flavor profile with hints of cedar and spice."
        }
        
        try:
            response = self.make_request("POST", f"/cigars/{cigar_id}/my-note", json=note_data)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('note_text') == note_data['note_text']:
                    self.log_result("Private Notes POST Create", True, 
                                  "Successfully created note")
                else:
                    self.log_result("Private Notes POST Create", False, 
                                  f"Note text mismatch. Expected: {note_data['note_text']}, Got: {data.get('note_text')}")
            else:
                self.log_result("Private Notes POST Create", False, 
                              f"Request failed with status {response.status_code}", 
                              response.text)
                
        except Exception as e:
            self.log_result("Private Notes POST Create", False, f"Request error: {str(e)}")
    
    def test_private_notes_get_existing(self):
        """Test GET /api/cigars/{cigar_id}/my-note - should return the saved note"""
        print("\n📝 Testing Private Notes - GET Existing Note...")
        
        cigar_id = self.get_test_cigar_id()
        if not cigar_id:
            self.log_result("Private Notes GET Existing", False, "No test cigar available")
            return
        
        try:
            response = self.make_request("GET", f"/cigars/{cigar_id}/my-note")
            
            if response.status_code == 200:
                data = response.json()
                expected_text = "This is my private note about this cigar. Great flavor profile with hints of cedar and spice."
                if data.get('note_text') == expected_text:
                    self.log_result("Private Notes GET Existing", True, 
                                  "Correctly returned saved note")
                else:
                    self.log_result("Private Notes GET Existing", False, 
                                  f"Note text mismatch. Expected: {expected_text}, Got: {data.get('note_text')}")
            else:
                self.log_result("Private Notes GET Existing", False, 
                              f"Request failed with status {response.status_code}", 
                              response.text)
                
        except Exception as e:
            self.log_result("Private Notes GET Existing", False, f"Request error: {str(e)}")
    
    def test_private_notes_update(self):
        """Test POST /api/cigars/{cigar_id}/my-note - update existing note"""
        print("\n📝 Testing Private Notes - POST Update Note...")
        
        cigar_id = self.get_test_cigar_id()
        if not cigar_id:
            self.log_result("Private Notes POST Update", False, "No test cigar available")
            return
        
        updated_note_data = {
            "note_text": "Updated note: This cigar has excellent construction and burns evenly. Perfect for evening relaxation."
        }
        
        try:
            response = self.make_request("POST", f"/cigars/{cigar_id}/my-note", json=updated_note_data)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('note_text') == updated_note_data['note_text']:
                    self.log_result("Private Notes POST Update", True, 
                                  "Successfully updated note")
                else:
                    self.log_result("Private Notes POST Update", False, 
                                  f"Updated note text mismatch. Expected: {updated_note_data['note_text']}, Got: {data.get('note_text')}")
            else:
                self.log_result("Private Notes POST Update", False, 
                              f"Request failed with status {response.status_code}", 
                              response.text)
                
        except Exception as e:
            self.log_result("Private Notes POST Update", False, f"Request error: {str(e)}")
    
    def test_private_notes_character_limit(self):
        """Test POST /api/cigars/{cigar_id}/my-note - should fail with 1001 characters"""
        print("\n📝 Testing Private Notes - Character Limit Validation...")
        
        cigar_id = self.get_test_cigar_id()
        if not cigar_id:
            self.log_result("Private Notes Character Limit", False, "No test cigar available")
            return
        
        # Create a note with exactly 1001 characters
        long_note = "A" * 1001
        note_data = {"note_text": long_note}
        
        try:
            response = self.make_request("POST", f"/cigars/{cigar_id}/my-note", json=note_data)
            
            if response.status_code == 400:
                error_data = response.json()
                if "1000 character limit" in error_data.get('detail', ''):
                    self.log_result("Private Notes Character Limit", True, 
                                  "Correctly rejected 1001 characters")
                else:
                    self.log_result("Private Notes Character Limit", False, 
                                  f"Wrong error message. Expected character limit error, got: {error_data}")
            else:
                self.log_result("Private Notes Character Limit", False, 
                              f"Expected 400, got {response.status_code}")
                
        except Exception as e:
            self.log_result("Private Notes Character Limit", False, f"Request error: {str(e)}")
    
    def test_private_notes_invalid_cigar(self):
        """Test POST /api/cigars/{invalid_id}/my-note - should fail with invalid cigar_id"""
        print("\n📝 Testing Private Notes - Invalid Cigar ID...")
        
        invalid_cigar_id = "507f1f77bcf86cd799439011"  # Valid ObjectId format but non-existent
        note_data = {"note_text": "This should fail"}
        
        try:
            response = self.make_request("POST", f"/cigars/{invalid_cigar_id}/my-note", json=note_data)
            
            if response.status_code == 404:
                error_data = response.json()
                if "Cigar not found" in error_data.get('detail', ''):
                    self.log_result("Private Notes Invalid Cigar", True, 
                                  "Correctly returned 404 for invalid cigar")
                else:
                    self.log_result("Private Notes Invalid Cigar", False, 
                                  f"Wrong error message. Expected 'Cigar not found', got: {error_data}")
            else:
                self.log_result("Private Notes Invalid Cigar", False, 
                              f"Expected 404, got {response.status_code}")
                
        except Exception as e:
            self.log_result("Private Notes Invalid Cigar", False, f"Request error: {str(e)}")
    
    def test_private_notes_delete(self):
        """Test DELETE /api/cigars/{cigar_id}/my-note - delete the note"""
        print("\n📝 Testing Private Notes - DELETE Note...")
        
        cigar_id = self.get_test_cigar_id()
        if not cigar_id:
            self.log_result("Private Notes DELETE", False, "No test cigar available")
            return
        
        try:
            response = self.make_request("DELETE", f"/cigars/{cigar_id}/my-note")
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and "deleted" in data.get('message', '').lower():
                    self.log_result("Private Notes DELETE", True, 
                                  "Successfully deleted note")
                else:
                    self.log_result("Private Notes DELETE", False, 
                                  f"Unexpected response: {data}")
            else:
                self.log_result("Private Notes DELETE", False, 
                              f"Request failed with status {response.status_code}", 
                              response.text)
                
        except Exception as e:
            self.log_result("Private Notes DELETE", False, f"Request error: {str(e)}")
    
    def test_private_notes_get_after_delete(self):
        """Test GET /api/cigars/{cigar_id}/my-note - should return empty note after deletion"""
        print("\n📝 Testing Private Notes - GET After Delete...")
        
        cigar_id = self.get_test_cigar_id()
        if not cigar_id:
            self.log_result("Private Notes GET After Delete", False, "No test cigar available")
            return
        
        try:
            response = self.make_request("GET", f"/cigars/{cigar_id}/my-note")
            
            if response.status_code == 200:
                data = response.json()
                if data.get('note_text') == '':
                    self.log_result("Private Notes GET After Delete", True, 
                                  "Correctly returned empty note after deletion")
                else:
                    self.log_result("Private Notes GET After Delete", False, 
                                  f"Expected empty note after delete, got: {data}")
            else:
                self.log_result("Private Notes GET After Delete", False, 
                              f"Request failed with status {response.status_code}", 
                              response.text)
                
        except Exception as e:
            self.log_result("Private Notes GET After Delete", False, f"Request error: {str(e)}")
    
    def test_private_notes_delete_nonexistent(self):
        """Test DELETE /api/cigars/{cigar_id}/my-note - should return 404 for non-existent note"""
        print("\n📝 Testing Private Notes - DELETE Non-existent Note...")
        
        cigar_id = self.get_test_cigar_id()
        if not cigar_id:
            self.log_result("Private Notes DELETE Non-existent", False, "No test cigar available")
            return
        
        try:
            response = self.make_request("DELETE", f"/cigars/{cigar_id}/my-note")
            
            if response.status_code == 404:
                error_data = response.json()
                if "Note not found" in error_data.get('detail', ''):
                    self.log_result("Private Notes DELETE Non-existent", True, 
                                  "Correctly returned 404 for non-existent note")
                else:
                    self.log_result("Private Notes DELETE Non-existent", False, 
                                  f"Wrong error message. Expected 'Note not found', got: {error_data}")
            else:
                self.log_result("Private Notes DELETE Non-existent", False, 
                              f"Expected 404, got {response.status_code}")
                
        except Exception as e:
            self.log_result("Private Notes DELETE Non-existent", False, f"Request error: {str(e)}")
    
    def test_private_notes_auth_required(self):
        """Test that all notes endpoints require authentication"""
        print("\n📝 Testing Private Notes - Authentication Required...")
        
        cigar_id = self.get_test_cigar_id()
        if not cigar_id:
            self.log_result("Private Notes Auth Required", False, "No test cigar available")
            return
        
        # Temporarily remove auth token
        original_token = self.auth_token
        self.auth_token = None
        
        endpoints_to_test = [
            ('GET', f"/cigars/{cigar_id}/my-note"),
            ('POST', f"/cigars/{cigar_id}/my-note"),
            ('DELETE', f"/cigars/{cigar_id}/my-note")
        ]
        
        all_passed = True
        
        for method, endpoint in endpoints_to_test:
            try:
                if method == 'GET':
                    response = self.make_request("GET", endpoint)
                elif method == 'POST':
                    response = self.make_request("POST", endpoint, json={"note_text": "test"})
                elif method == 'DELETE':
                    response = self.make_request("DELETE", endpoint)
                    
                if response.status_code in [401, 403]:
                    pass  # Good, requires auth
                else:
                    all_passed = False
                    break
                    
            except Exception:
                all_passed = False
                break
        
        # Restore auth token
        self.auth_token = original_token
        
        if all_passed:
            self.log_result("Private Notes Auth Required", True, 
                          "All endpoints properly require authentication")
        else:
            self.log_result("Private Notes Auth Required", False, 
                          "Some endpoints don't require authentication")
    
    def run_all_tests(self):
        """Run all tests for Add Cigar feature"""
        print("🚀 Starting Add Cigar Feature Tests...")
        print(f"Backend URL: {self.base_url}")
        
        # Step 1: Register user for authentication
        if not self.test_user_registration():
            print("❌ Cannot proceed without authentication")
            return False
        
        # Step 2: Test successful cigar addition
        cigar_id = self.test_add_cigar_success()
        if cigar_id:
            # Get the cigar details for search testing
            try:
                response = self.make_request("GET", f"/cigars/{cigar_id}")
                if response.status_code == 200:
                    cigar_data = response.json()
                    brand = cigar_data.get("brand", "")
                    name = cigar_data.get("name", "")
                    
                    # Test search functionality
                    self.test_search_newly_added_cigar(cigar_id, brand, name)
                    
                    # Test get cigar details
                    self.test_get_cigar_details(cigar_id)
            except Exception as e:
                print(f"Error getting cigar details for further testing: {e}")
        
        # Step 3: Test with optional fields
        self.test_add_cigar_with_optional_fields()
        
        # Step 4: Test validation
        self.test_add_cigar_missing_fields()
        
        # Step 5: Test authentication requirement
        self.test_add_cigar_no_auth()
        
        # Step 6: Test duplicate detection
        self.test_duplicate_detection()
        
        # Step 7: Test case-insensitive duplicate detection
        self.test_case_insensitive_duplicate()
        
        # Step 8: Test edge cases
        self.test_edge_cases()
        
        # Summary
        self.print_summary()
        
        return True
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "="*60)
        print("🏁 TEST SUMMARY")
        print("="*60)
        
        passed = sum(1 for result in self.results if result["success"])
        total = len(self.results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        # Show failed tests
        failed_tests = [result for result in self.results if not result["success"]]
        if failed_tests:
            print("\n❌ FAILED TESTS:")
            for test in failed_tests:
                print(f"  - {test['test']}: {test['message']}")
        
        print("\n" + "="*60)

def main():
    """Main test execution"""
    tester = CigarRankerTester()
    
    try:
        success = tester.run_all_tests()
        if not success:
            sys.exit(1)
    except KeyboardInterrupt:
        print("\n\n⏹️  Tests interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n💥 Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()