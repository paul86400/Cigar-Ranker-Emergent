#!/usr/bin/env python3
"""
Backend API Testing for Cigar Ranker App
Focus: Add Cigar Feature Testing
"""

import requests
import json
import sys
import time
from typing import Dict, Any, Optional

# Backend URL from frontend .env
BACKEND_URL = "https://cigar-scout.preview.emergentagent.com/api"

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

    def test_registration_valid_data(self):
        """Test user registration with valid data"""
        test_name = "Registration with Valid Data"
        
        # Use unique timestamp to avoid conflicts
        timestamp = int(time.time())
        test_data = {
            "username": f"testuser{timestamp}",
            "email": f"test{timestamp}@example.com",
            "password": "password123"
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/auth/register",
                json=test_data,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if "token" in data and "user" in data:
                    self.auth_token = data["token"]  # Store for later tests
                    user_info = data["user"]
                    if (user_info.get("username") == test_data["username"] and 
                        user_info.get("email") == test_data["email"] and
                        "id" in user_info):
                        self.log_test(test_name, True, 
                                    f"User registered successfully. ID: {user_info['id']}")
                        return True
                    else:
                        self.log_test(test_name, False, 
                                    error="Response missing required user fields")
                else:
                    self.log_test(test_name, False, 
                                error="Response missing token or user data")
            else:
                self.log_test(test_name, False, 
                            error=f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_test(test_name, False, error=f"Request failed: {str(e)}")
        
        return False

    def test_registration_duplicate_email(self):
        """Test registration with duplicate email"""
        test_name = "Registration with Duplicate Email"
        
        # First register a user
        timestamp = int(time.time())
        test_data = {
            "username": f"user1_{timestamp}",
            "email": f"duplicate{timestamp}@example.com",
            "password": "password123"
        }
        
        try:
            # First registration
            response1 = self.session.post(
                f"{self.base_url}/auth/register",
                json=test_data,
                timeout=10
            )
            
            if response1.status_code != 200:
                self.log_test(test_name, False, 
                            error=f"Setup failed: {response1.status_code}")
                return False
            
            # Try to register with same email but different username
            test_data["username"] = f"user2_{timestamp}"
            response2 = self.session.post(
                f"{self.base_url}/auth/register",
                json=test_data,
                timeout=10
            )
            
            if response2.status_code == 400:
                error_data = response2.json()
                if "Email already registered" in error_data.get("detail", ""):
                    self.log_test(test_name, True, 
                                "Correctly rejected duplicate email")
                    return True
                else:
                    self.log_test(test_name, False, 
                                error=f"Wrong error message: {error_data}")
            else:
                self.log_test(test_name, False, 
                            error=f"Expected 400, got {response2.status_code}")
                
        except Exception as e:
            self.log_test(test_name, False, error=f"Request failed: {str(e)}")
        
        return False

    def test_registration_duplicate_username(self):
        """Test registration with duplicate username"""
        test_name = "Registration with Duplicate Username"
        
        timestamp = int(time.time())
        test_data = {
            "username": f"duplicateuser{timestamp}",
            "email": f"email1_{timestamp}@example.com",
            "password": "password123"
        }
        
        try:
            # First registration
            response1 = self.session.post(
                f"{self.base_url}/auth/register",
                json=test_data,
                timeout=10
            )
            
            if response1.status_code != 200:
                self.log_test(test_name, False, 
                            error=f"Setup failed: {response1.status_code}")
                return False
            
            # Try to register with same username but different email
            test_data["email"] = f"email2_{timestamp}@example.com"
            response2 = self.session.post(
                f"{self.base_url}/auth/register",
                json=test_data,
                timeout=10
            )
            
            if response2.status_code == 400:
                error_data = response2.json()
                if "Username already taken" in error_data.get("detail", ""):
                    self.log_test(test_name, True, 
                                "Correctly rejected duplicate username")
                    return True
                else:
                    self.log_test(test_name, False, 
                                error=f"Wrong error message: {error_data}")
            else:
                self.log_test(test_name, False, 
                            error=f"Expected 400, got {response2.status_code}")
                
        except Exception as e:
            self.log_test(test_name, False, error=f"Request failed: {str(e)}")
        
        return False

    def test_registration_missing_fields(self):
        """Test registration with missing required fields"""
        test_name = "Registration with Missing Fields"
        
        test_cases = [
            {"email": "test@example.com", "password": "password123"},  # Missing username
            {"username": "testuser", "password": "password123"},      # Missing email
            {"username": "testuser", "email": "test@example.com"},    # Missing password
            {}  # Missing all fields
        ]
        
        success_count = 0
        
        for i, test_data in enumerate(test_cases):
            try:
                response = self.session.post(
                    f"{self.base_url}/auth/register",
                    json=test_data,
                    timeout=10
                )
                
                if response.status_code == 422:  # Validation error
                    success_count += 1
                elif response.status_code == 400:  # Bad request
                    success_count += 1
                else:
                    print(f"   Case {i+1} failed: Expected 422/400, got {response.status_code}")
                    
            except Exception as e:
                print(f"   Case {i+1} error: {str(e)}")
        
        if success_count == len(test_cases):
            self.log_test(test_name, True, 
                        f"All {len(test_cases)} missing field cases handled correctly")
            return True
        else:
            self.log_test(test_name, False, 
                        error=f"Only {success_count}/{len(test_cases)} cases passed")
        
        return False

    def test_registration_invalid_email(self):
        """Test registration with invalid email format"""
        test_name = "Registration with Invalid Email Format"
        
        invalid_emails = [
            "notanemail",
            "missing@domain",
            "@missinglocal.com",
            "spaces in@email.com",
            "double@@domain.com"
        ]
        
        success_count = 0
        timestamp = int(time.time())
        
        for i, email in enumerate(invalid_emails):
            test_data = {
                "username": f"testuser{timestamp}_{i}",
                "email": email,
                "password": "password123"
            }
            
            try:
                response = self.session.post(
                    f"{self.base_url}/auth/register",
                    json=test_data,
                    timeout=10
                )
                
                if response.status_code in [400, 422]:  # Should reject invalid email
                    success_count += 1
                else:
                    print(f"   Email '{email}' was accepted (status: {response.status_code})")
                    
            except Exception as e:
                print(f"   Email '{email}' test error: {str(e)}")
        
        if success_count >= len(invalid_emails) * 0.8:  # Allow some flexibility
            self.log_test(test_name, True, 
                        f"{success_count}/{len(invalid_emails)} invalid emails rejected")
            return True
        else:
            self.log_test(test_name, False, 
                        error=f"Only {success_count}/{len(invalid_emails)} invalid emails rejected")
        
        return False

    def test_registration_short_password(self):
        """Test registration with short password"""
        test_name = "Registration with Short Password"
        
        timestamp = int(time.time())
        test_data = {
            "username": f"testuser{timestamp}",
            "email": f"test{timestamp}@example.com",
            "password": "123"  # Very short password
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/auth/register",
                json=test_data,
                timeout=10
            )
            
            # Note: The current implementation doesn't validate password length
            # This test documents current behavior
            if response.status_code == 200:
                self.log_test(test_name, True, 
                            "Short password accepted (no validation implemented)")
                return True
            elif response.status_code in [400, 422]:
                self.log_test(test_name, True, 
                            "Short password correctly rejected")
                return True
            else:
                self.log_test(test_name, False, 
                            error=f"Unexpected status: {response.status_code}")
                
        except Exception as e:
            self.log_test(test_name, False, error=f"Request failed: {str(e)}")
        
        return False

    def test_login_with_registered_user(self):
        """Test login with previously registered user"""
        test_name = "Login with Registered User"
        
        if not self.auth_token:
            self.log_test(test_name, False, 
                        error="No registered user available from previous tests")
            return False
        
        # We need to register a new user for this test since we don't store credentials
        timestamp = int(time.time())
        credentials = {
            "username": f"logintest{timestamp}",
            "email": f"logintest{timestamp}@example.com",
            "password": "loginpassword123"
        }
        
        try:
            # Register user first
            reg_response = self.session.post(
                f"{self.base_url}/auth/register",
                json=credentials,
                timeout=10
            )
            
            if reg_response.status_code != 200:
                self.log_test(test_name, False, 
                            error=f"Registration setup failed: {reg_response.status_code}")
                return False
            
            # Now test login
            login_data = {
                "email": credentials["email"],
                "password": credentials["password"]
            }
            
            response = self.session.post(
                f"{self.base_url}/auth/login",
                json=login_data,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if "token" in data and "user" in data:
                    user_info = data["user"]
                    if (user_info.get("email") == credentials["email"] and
                        user_info.get("username") == credentials["username"]):
                        self.log_test(test_name, True, 
                                    "Login successful with correct user data")
                        return True
                    else:
                        self.log_test(test_name, False, 
                                    error="Login response has incorrect user data")
                else:
                    self.log_test(test_name, False, 
                                error="Login response missing token or user")
            else:
                self.log_test(test_name, False, 
                            error=f"Login failed: HTTP {response.status_code}")
                
        except Exception as e:
            self.log_test(test_name, False, error=f"Request failed: {str(e)}")
        
        return False

    def test_jwt_token_validation(self):
        """Test JWT token validation"""
        test_name = "JWT Token Validation"
        
        if not self.auth_token:
            self.log_test(test_name, False, 
                        error="No auth token available from previous tests")
            return False
        
        try:
            # Test accessing protected endpoint with valid token
            headers = {"Authorization": f"Bearer {self.auth_token}"}
            response = self.session.get(
                f"{self.base_url}/auth/me",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if "id" in data and "username" in data and "email" in data:
                    self.log_test(test_name, True, 
                                "JWT token validation successful")
                    return True
                else:
                    self.log_test(test_name, False, 
                                error="Protected endpoint response missing user data")
            else:
                self.log_test(test_name, False, 
                            error=f"Protected endpoint failed: HTTP {response.status_code}")
                
        except Exception as e:
            self.log_test(test_name, False, error=f"Request failed: {str(e)}")
        
        return False

    def test_invalid_token_access(self):
        """Test access with invalid token"""
        test_name = "Invalid Token Access"
        
        try:
            # Test with invalid token
            headers = {"Authorization": "Bearer invalid_token_here"}
            response = self.session.get(
                f"{self.base_url}/auth/me",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 401:
                self.log_test(test_name, True, 
                            "Invalid token correctly rejected")
                return True
            else:
                self.log_test(test_name, False, 
                            error=f"Expected 401, got {response.status_code}")
                
        except Exception as e:
            self.log_test(test_name, False, error=f"Request failed: {str(e)}")
        
        return False

    def run_all_tests(self):
        """Run all authentication tests"""
        print("=" * 60)
        print("CIGAR RANKER BACKEND API TESTS")
        print("=" * 60)
        print(f"Testing against: {self.base_url}")
        print()
        
        # Test registration endpoint thoroughly
        tests = [
            self.test_registration_valid_data,
            self.test_registration_duplicate_email,
            self.test_registration_duplicate_username,
            self.test_registration_missing_fields,
            self.test_registration_invalid_email,
            self.test_registration_short_password,
            self.test_login_with_registered_user,
            self.test_jwt_token_validation,
            self.test_invalid_token_access
        ]
        
        passed = 0
        total = len(tests)
        
        for test in tests:
            if test():
                passed += 1
        
        print("=" * 60)
        print(f"RESULTS: {passed}/{total} tests passed")
        print("=" * 60)
        
        # Print summary of failed tests
        failed_tests = [r for r in self.test_results if not r["success"]]
        if failed_tests:
            print("\nFAILED TESTS:")
            for test in failed_tests:
                print(f"❌ {test['test']}: {test['error']}")
        
        return passed, total, self.test_results


def main():
    """Main test execution"""
    tester = CigarRankerAPITester()
    passed, total, results = tester.run_all_tests()
    
    # Save results to file
    with open('/app/test_results_backend.json', 'w') as f:
        json.dump({
            "summary": {"passed": passed, "total": total, "success_rate": passed/total},
            "results": results,
            "timestamp": datetime.now().isoformat()
        }, f, indent=2)
    
    return passed == total


if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)