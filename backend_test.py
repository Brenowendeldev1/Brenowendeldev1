#!/usr/bin/env python3
"""
Backend API Testing Script for E-commerce Application
Tests all product and order management endpoints
"""

import requests
import json
import sys
from datetime import datetime

# Backend URL from frontend/.env
BACKEND_URL = "https://cbac237b-2c07-4215-880a-457a31668f2e.preview.emergentagent.com/api"

class BackendTester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.session = requests.Session()
        self.test_results = []
        
    def log_test(self, test_name, success, message, response_data=None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "timestamp": datetime.now().isoformat()
        }
        if response_data:
            result["response_data"] = response_data
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        
    def test_sample_data_initialization(self):
        """Test POST /api/init-data endpoint"""
        try:
            response = self.session.post(f"{self.base_url}/init-data")
            
            if response.status_code == 200:
                data = response.json()
                self.log_test(
                    "Sample Data Initialization", 
                    True, 
                    f"Sample data initialized successfully: {data.get('message', '')}"
                )
                return True
            else:
                self.log_test(
                    "Sample Data Initialization", 
                    False, 
                    f"Failed with status {response.status_code}: {response.text}"
                )
                return False
                
        except Exception as e:
            self.log_test("Sample Data Initialization", False, f"Exception: {str(e)}")
            return False
    
    def test_get_all_products(self):
        """Test GET /api/products endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/products")
            
            if response.status_code == 200:
                products = response.json()
                if isinstance(products, list) and len(products) > 0:
                    self.log_test(
                        "Get All Products", 
                        True, 
                        f"Retrieved {len(products)} products successfully",
                        {"product_count": len(products), "first_product": products[0] if products else None}
                    )
                    return products
                else:
                    self.log_test("Get All Products", False, "No products returned or invalid format")
                    return []
            else:
                self.log_test(
                    "Get All Products", 
                    False, 
                    f"Failed with status {response.status_code}: {response.text}"
                )
                return []
                
        except Exception as e:
            self.log_test("Get All Products", False, f"Exception: {str(e)}")
            return []
    
    def test_get_products_by_category(self):
        """Test GET /api/products/category/{category} for all categories"""
        categories = ["geeks", "gel-dor", "diversos"]
        category_results = {}
        
        for category in categories:
            try:
                response = self.session.get(f"{self.base_url}/products/category/{category}")
                
                if response.status_code == 200:
                    products = response.json()
                    if isinstance(products, list):
                        category_results[category] = len(products)
                        self.log_test(
                            f"Get Products by Category ({category})", 
                            True, 
                            f"Retrieved {len(products)} products for category '{category}'"
                        )
                    else:
                        self.log_test(
                            f"Get Products by Category ({category})", 
                            False, 
                            "Invalid response format"
                        )
                else:
                    self.log_test(
                        f"Get Products by Category ({category})", 
                        False, 
                        f"Failed with status {response.status_code}: {response.text}"
                    )
                    
            except Exception as e:
                self.log_test(
                    f"Get Products by Category ({category})", 
                    False, 
                    f"Exception: {str(e)}"
                )
        
        return category_results
    
    def test_get_single_product(self, product_id):
        """Test GET /api/products/{product_id} endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/products/{product_id}")
            
            if response.status_code == 200:
                product = response.json()
                if product.get('id') == product_id:
                    self.log_test(
                        "Get Single Product", 
                        True, 
                        f"Retrieved product '{product.get('name')}' successfully"
                    )
                    return product
                else:
                    self.log_test("Get Single Product", False, "Product ID mismatch in response")
                    return None
            elif response.status_code == 404:
                self.log_test("Get Single Product", True, "Product not found (404) - expected behavior")
                return None
            else:
                self.log_test(
                    "Get Single Product", 
                    False, 
                    f"Failed with status {response.status_code}: {response.text}"
                )
                return None
                
        except Exception as e:
            self.log_test("Get Single Product", False, f"Exception: {str(e)}")
            return None
    
    def test_create_product(self):
        """Test POST /api/products endpoint"""
        test_product = {
            "name": "Produto de Teste",
            "description": "Produto criado durante teste automatizado",
            "price": 99.99,
            "category": "diversos",
            "image_url": "https://via.placeholder.com/300x200",
            "in_stock": True,
            "stock_quantity": 10
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/products",
                json=test_product,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                created_product = response.json()
                if created_product.get('name') == test_product['name']:
                    self.log_test(
                        "Create Product", 
                        True, 
                        f"Product created successfully with ID: {created_product.get('id')}"
                    )
                    return created_product
                else:
                    self.log_test("Create Product", False, "Product data mismatch in response")
                    return None
            else:
                self.log_test(
                    "Create Product", 
                    False, 
                    f"Failed with status {response.status_code}: {response.text}"
                )
                return None
                
        except Exception as e:
            self.log_test("Create Product", False, f"Exception: {str(e)}")
            return None
    
    def test_create_order(self):
        """Test POST /api/orders endpoint"""
        test_order = {
            "customer_name": "João Silva",
            "customer_email": "joao.silva@email.com",
            "customer_phone": "(11) 99999-9999",
            "customer_address": "Rua das Flores, 123 - São Paulo, SP",
            "items": [
                {
                    "product_id": "test-product-1",
                    "product_name": "Produto Teste 1",
                    "price": 29.99,
                    "quantity": 2
                },
                {
                    "product_id": "test-product-2", 
                    "product_name": "Produto Teste 2",
                    "price": 45.50,
                    "quantity": 1
                }
            ],
            "total": 105.48
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/orders",
                json=test_order,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                created_order = response.json()
                if created_order.get('customer_name') == test_order['customer_name']:
                    self.log_test(
                        "Create Order", 
                        True, 
                        f"Order created successfully with ID: {created_order.get('id')}"
                    )
                    return created_order
                else:
                    self.log_test("Create Order", False, "Order data mismatch in response")
                    return None
            else:
                self.log_test(
                    "Create Order", 
                    False, 
                    f"Failed with status {response.status_code}: {response.text}"
                )
                return None
                
        except Exception as e:
            self.log_test("Create Order", False, f"Exception: {str(e)}")
            return None
    
    def test_get_all_orders(self):
        """Test GET /api/orders endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/orders")
            
            if response.status_code == 200:
                orders = response.json()
                if isinstance(orders, list):
                    self.log_test(
                        "Get All Orders", 
                        True, 
                        f"Retrieved {len(orders)} orders successfully"
                    )
                    return orders
                else:
                    self.log_test("Get All Orders", False, "Invalid response format")
                    return []
            else:
                self.log_test(
                    "Get All Orders", 
                    False, 
                    f"Failed with status {response.status_code}: {response.text}"
                )
                return []
                
        except Exception as e:
            self.log_test("Get All Orders", False, f"Exception: {str(e)}")
            return []
    
    def test_get_single_order(self, order_id):
        """Test GET /api/orders/{order_id} endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/orders/{order_id}")
            
            if response.status_code == 200:
                order = response.json()
                if order.get('id') == order_id:
                    self.log_test(
                        "Get Single Order", 
                        True, 
                        f"Retrieved order for customer '{order.get('customer_name')}' successfully"
                    )
                    return order
                else:
                    self.log_test("Get Single Order", False, "Order ID mismatch in response")
                    return None
            elif response.status_code == 404:
                self.log_test("Get Single Order", True, "Order not found (404) - expected behavior")
                return None
            else:
                self.log_test(
                    "Get Single Order", 
                    False, 
                    f"Failed with status {response.status_code}: {response.text}"
                )
                return None
                
        except Exception as e:
            self.log_test("Get Single Order", False, f"Exception: {str(e)}")
            return None
    
    def test_database_connectivity(self):
        """Test database connectivity by checking if we can retrieve data"""
        try:
            # Try to get products to test DB connectivity
            response = self.session.get(f"{self.base_url}/products")
            
            if response.status_code == 200:
                self.log_test(
                    "Database Connectivity", 
                    True, 
                    "Database connection working - able to retrieve data"
                )
                return True
            else:
                self.log_test(
                    "Database Connectivity", 
                    False, 
                    f"Database connection issue - status {response.status_code}"
                )
                return False
                
        except Exception as e:
            self.log_test("Database Connectivity", False, f"Database connection failed: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all backend tests in sequence"""
        print(f"🚀 Starting Backend API Tests")
        print(f"Backend URL: {self.base_url}")
        print("=" * 60)
        
        # Test 1: Database connectivity
        db_connected = self.test_database_connectivity()
        
        # Test 2: Initialize sample data
        self.test_sample_data_initialization()
        
        # Test 3: Get all products
        products = self.test_get_all_products()
        
        # Test 4: Get products by category
        self.test_get_products_by_category()
        
        # Test 5: Get single product (if we have products)
        if products:
            first_product_id = products[0].get('id')
            if first_product_id:
                self.test_get_single_product(first_product_id)
        
        # Test 6: Create new product
        created_product = self.test_create_product()
        
        # Test 7: Create order
        created_order = self.test_create_order()
        
        # Test 8: Get all orders
        orders = self.test_get_all_orders()
        
        # Test 9: Get single order (if we have orders)
        if created_order:
            order_id = created_order.get('id')
            if order_id:
                self.test_get_single_order(order_id)
        
        # Print summary
        self.print_summary()
        
        return self.test_results
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result['success'])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  - {result['test']}: {result['message']}")
        
        print("\n" + "=" * 60)

def main():
    """Main function to run all tests"""
    tester = BackendTester()
    results = tester.run_all_tests()
    
    # Return exit code based on test results
    failed_tests = sum(1 for result in results if not result['success'])
    sys.exit(1 if failed_tests > 0 else 0)

if __name__ == "__main__":
    main()