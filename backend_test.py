#!/usr/bin/env python3
"""
ARKADHATRI Backend API Test Suite
Tests all backend endpoints as per test_result.md requirements
"""

import requests
import json
from datetime import datetime, timedelta

# Configuration
BASE_URL = "https://timeless-crafted-8.preview.emergentagent.com/api"
ADMIN_EMAIL = "admin@arkadhatri.com"
ADMIN_PASSWORD = "ArkAdmin@2025"

# Global state
admin_cookie = None
test_coupon_id = None
test_product_id = None
test_order_id = None
original_stock = None

def print_test(name):
    print(f"\n{'='*80}")
    print(f"TEST: {name}")
    print('='*80)

def print_pass(msg):
    print(f"✅ PASS: {msg}")

def print_fail(msg):
    print(f"❌ FAIL: {msg}")

def print_info(msg):
    print(f"ℹ️  INFO: {msg}")

# ============================================================================
# Test 1: Admin Login
# ============================================================================
def test_admin_login():
    print_test("1. POST /api/admin/login - Admin Authentication")
    global admin_cookie
    
    try:
        # Test with correct credentials
        print_info("Testing with correct credentials...")
        response = requests.post(
            f"{BASE_URL}/admin/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get('ok') and 'Set-Cookie' in response.headers:
                admin_cookie = response.cookies
                print_pass(f"Admin login successful with correct credentials")
                print_info(f"Response: {data}")
            else:
                print_fail(f"Login response missing expected fields: {data}")
                return False
        else:
            print_fail(f"Login failed with status {response.status_code}: {response.text}")
            return False
        
        # Test with wrong credentials
        print_info("Testing with wrong credentials...")
        response = requests.post(
            f"{BASE_URL}/admin/login",
            json={"email": ADMIN_EMAIL, "password": "wrongpassword"},
            timeout=10
        )
        
        if response.status_code == 401:
            print_pass("Correctly rejected wrong credentials with 401")
        else:
            print_fail(f"Expected 401 for wrong credentials, got {response.status_code}")
            return False
        
        return True
        
    except Exception as e:
        print_fail(f"Exception during admin login test: {str(e)}")
        return False

# ============================================================================
# Test 2: Admin /me endpoint
# ============================================================================
def test_admin_me():
    print_test("2. GET /api/admin/me - Verify Admin Session")
    
    try:
        response = requests.get(
            f"{BASE_URL}/admin/me",
            cookies=admin_cookie,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get('email') == ADMIN_EMAIL:
                print_pass(f"Admin /me endpoint working: {data}")
                return True
            else:
                print_fail(f"Unexpected email in response: {data}")
                return False
        else:
            print_fail(f"Admin /me failed with status {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print_fail(f"Exception during admin /me test: {str(e)}")
        return False

# ============================================================================
# Test 3: Create Test Coupon
# ============================================================================
def test_create_coupon():
    print_test("3. POST /api/admin/coupons - Create Test Coupon ARKTEST10")
    global test_coupon_id
    
    try:
        coupon_data = {
            "code": "ARKTEST10",
            "type": "percentage",
            "value": 10,
            "minPurchase": 5000,
            "usageLimit": 100,
            "active": True
        }
        
        response = requests.post(
            f"{BASE_URL}/admin/coupons",
            json=coupon_data,
            cookies=admin_cookie,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            coupon = data.get('coupon')
            if coupon and coupon.get('code') == 'ARKTEST10':
                test_coupon_id = coupon.get('id')
                print_pass(f"Test coupon created successfully: {coupon}")
                print_info(f"Coupon ID: {test_coupon_id}")
                return True
            else:
                print_fail(f"Unexpected coupon response: {data}")
                return False
        else:
            print_fail(f"Coupon creation failed with status {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print_fail(f"Exception during coupon creation: {str(e)}")
        return False

# ============================================================================
# Test 4: Coupon Validation Endpoint
# ============================================================================
def test_coupon_validation():
    print_test("4. POST /api/coupons/validate - Coupon Validation Scenarios")
    
    all_passed = True
    
    # Scenario a: Valid coupon with sufficient subtotal
    try:
        print_info("Scenario a: Valid coupon ARKTEST10 with subtotal 20000")
        response = requests.post(
            f"{BASE_URL}/coupons/validate",
            json={"code": "ARKTEST10", "subtotal": 20000},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get('ok') and data.get('discount') == 2000:
                print_pass(f"Valid coupon validated correctly: discount={data.get('discount')}")
            else:
                print_fail(f"Unexpected validation response: {data}")
                all_passed = False
        else:
            print_fail(f"Validation failed with status {response.status_code}: {response.text}")
            all_passed = False
    except Exception as e:
        print_fail(f"Exception in scenario a: {str(e)}")
        all_passed = False
    
    # Scenario b: Valid coupon but below minPurchase
    try:
        print_info("Scenario b: Valid coupon ARKTEST10 with subtotal 1000 (below minPurchase 5000)")
        response = requests.post(
            f"{BASE_URL}/coupons/validate",
            json={"code": "ARKTEST10", "subtotal": 1000},
            timeout=10
        )
        
        if response.status_code == 400:
            data = response.json()
            if 'Minimum order' in data.get('error', '') or 'minPurchase' in data.get('error', '').lower():
                print_pass(f"Correctly rejected coupon below minPurchase: {data.get('error')}")
            else:
                print_fail(f"Wrong error message for minPurchase: {data}")
                all_passed = False
        else:
            print_fail(f"Expected 400 for below minPurchase, got {response.status_code}")
            all_passed = False
    except Exception as e:
        print_fail(f"Exception in scenario b: {str(e)}")
        all_passed = False
    
    # Scenario c: Invalid coupon code
    try:
        print_info("Scenario c: Invalid coupon code BOGUS")
        response = requests.post(
            f"{BASE_URL}/coupons/validate",
            json={"code": "BOGUS", "subtotal": 20000},
            timeout=10
        )
        
        if response.status_code == 404:
            data = response.json()
            if 'Invalid coupon' in data.get('error', ''):
                print_pass(f"Correctly rejected invalid coupon: {data.get('error')}")
            else:
                print_fail(f"Wrong error message for invalid coupon: {data}")
                all_passed = False
        else:
            print_fail(f"Expected 404 for invalid coupon, got {response.status_code}")
            all_passed = False
    except Exception as e:
        print_fail(f"Exception in scenario c: {str(e)}")
        all_passed = False
    
    # Scenario d: Empty coupon code
    try:
        print_info("Scenario d: Empty coupon code")
        response = requests.post(
            f"{BASE_URL}/coupons/validate",
            json={"code": "", "subtotal": 20000},
            timeout=10
        )
        
        if response.status_code == 400:
            data = response.json()
            if 'required' in data.get('error', '').lower():
                print_pass(f"Correctly rejected empty coupon code: {data.get('error')}")
            else:
                print_fail(f"Wrong error message for empty code: {data}")
                all_passed = False
        else:
            print_fail(f"Expected 400 for empty code, got {response.status_code}")
            all_passed = False
    except Exception as e:
        print_fail(f"Exception in scenario d: {str(e)}")
        all_passed = False
    
    return all_passed

# ============================================================================
# Test 5: Get Products and Store Test Product
# ============================================================================
def test_get_products():
    print_test("5. GET /api/admin/products - Get Products for Testing")
    global test_product_id, original_stock
    
    try:
        response = requests.get(
            f"{BASE_URL}/admin/products",
            cookies=admin_cookie,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            products = data.get('products', [])
            
            # Find a product with SKU ARK-KV-001 or use first product
            test_product = None
            for p in products:
                if p.get('sku') == 'ARK-KV-001':
                    test_product = p
                    break
            
            if not test_product and products:
                test_product = products[0]
            
            if test_product:
                test_product_id = test_product.get('id')
                original_stock = test_product.get('stock', 0)
                print_pass(f"Found test product: {test_product.get('name')} (SKU: {test_product.get('sku')})")
                print_info(f"Product ID: {test_product_id}, Current Stock: {original_stock}")
                return True
            else:
                print_fail("No products found in database")
                return False
        else:
            print_fail(f"Get products failed with status {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print_fail(f"Exception during get products: {str(e)}")
        return False

# ============================================================================
# Test 6: Order Creation Without Coupon
# ============================================================================
def test_order_without_coupon():
    print_test("6a. POST /api/orders - Order Creation WITHOUT Coupon")
    global test_order_id
    
    try:
        # Get current stock before order
        response = requests.get(
            f"{BASE_URL}/admin/products",
            cookies=admin_cookie,
            timeout=10
        )
        products = response.json().get('products', [])
        product = next((p for p in products if p.get('sku') == 'ARK-KV-001'), None)
        
        if not product:
            print_fail("Product ARK-KV-001 not found")
            return False
        
        stock_before = product.get('stock', 0)
        print_info(f"Stock before order: {stock_before}")
        
        order_data = {
            "items": [{
                "sku": "ARK-KV-001",
                "slug": "kavya",
                "name": "Kavya",
                "price": 24500,
                "qty": 1
            }],
            "customer": {
                "fullName": "Priya Sharma",
                "email": "priya.sharma@example.com",
                "mobile": "+919876543210",
                "address1": "123 MG Road",
                "city": "Bengaluru",
                "state": "Karnataka",
                "pincode": "560001"
            },
            "subtotal": 24500,
            "shipping": 0,
            "total": 24500,
            "currency": "INR"
        }
        
        response = requests.post(
            f"{BASE_URL}/orders",
            json=order_data,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            order = data.get('order')
            
            if not order:
                print_fail(f"No order in response: {data}")
                return False
            
            test_order_id = order.get('id')
            
            # Verify order fields
            checks = [
                (order.get('id'), "Order has UUID"),
                (order.get('paymentStatus') == 'pending', "Payment status is 'pending'"),
                (order.get('status') == 'received', "Order status is 'received'"),
                (order.get('discount') == 0, "Discount is 0"),
                (order.get('couponApplied') is None, "No coupon applied"),
                (order.get('total') == 24500, "Total is correct")
            ]
            
            all_checks_passed = True
            for check, desc in checks:
                if check:
                    print_pass(desc)
                else:
                    print_fail(desc)
                    all_checks_passed = False
            
            # Verify stock decrement
            response = requests.get(
                f"{BASE_URL}/admin/products",
                cookies=admin_cookie,
                timeout=10
            )
            products = response.json().get('products', [])
            product = next((p for p in products if p.get('sku') == 'ARK-KV-001'), None)
            
            if product:
                stock_after = product.get('stock', 0)
                print_info(f"Stock after order: {stock_after}")
                
                if stock_after == stock_before - 1:
                    print_pass(f"Stock decremented correctly from {stock_before} to {stock_after}")
                else:
                    print_fail(f"Stock not decremented correctly. Before: {stock_before}, After: {stock_after}")
                    all_checks_passed = False
            else:
                print_fail("Could not verify stock decrement - product not found")
                all_checks_passed = False
            
            return all_checks_passed
        else:
            print_fail(f"Order creation failed with status {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print_fail(f"Exception during order creation: {str(e)}")
        return False

# ============================================================================
# Test 7: Order Creation With Coupon
# ============================================================================
def test_order_with_coupon():
    print_test("6b. POST /api/orders - Order Creation WITH Coupon ARKTEST10")
    
    try:
        # Get current stock and coupon usage before order
        response = requests.get(
            f"{BASE_URL}/admin/products",
            cookies=admin_cookie,
            timeout=10
        )
        products = response.json().get('products', [])
        product = next((p for p in products if p.get('sku') == 'ARK-KV-001'), None)
        
        if not product:
            print_fail("Product ARK-KV-001 not found")
            return False
        
        stock_before = product.get('stock', 0)
        print_info(f"Stock before order: {stock_before}")
        
        # Get coupon usage before
        response = requests.get(
            f"{BASE_URL}/admin/coupons",
            cookies=admin_cookie,
            timeout=10
        )
        coupons = response.json().get('coupons', [])
        coupon = next((c for c in coupons if c.get('code') == 'ARKTEST10'), None)
        
        if not coupon:
            print_fail("Coupon ARKTEST10 not found")
            return False
        
        used_before = coupon.get('used', 0)
        print_info(f"Coupon used count before order: {used_before}")
        
        order_data = {
            "items": [{
                "sku": "ARK-KV-001",
                "slug": "kavya",
                "name": "Kavya",
                "price": 24500,
                "qty": 1
            }],
            "customer": {
                "fullName": "Ananya Reddy",
                "email": "ananya.reddy@example.com",
                "mobile": "+919123456789",
                "address1": "456 Brigade Road",
                "city": "Bengaluru",
                "state": "Karnataka",
                "pincode": "560025"
            },
            "subtotal": 24500,
            "shipping": 0,
            "total": 24500,
            "currency": "INR",
            "couponCode": "ARKTEST10"
        }
        
        response = requests.post(
            f"{BASE_URL}/orders",
            json=order_data,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            order = data.get('order')
            
            if not order:
                print_fail(f"No order in response: {data}")
                return False
            
            # Verify order fields
            discount = order.get('discount', 0)
            expected_discount = 2450  # 10% of 24500
            coupon_applied = order.get('couponApplied')
            
            checks = [
                (order.get('id'), "Order has UUID"),
                (abs(discount - expected_discount) <= 1, f"Discount is approximately {expected_discount} (got {discount})"),
                (coupon_applied and coupon_applied.get('code') == 'ARKTEST10', "Coupon ARKTEST10 applied"),
                (order.get('total') == 24500 - discount, f"Total is subtotal - discount (got {order.get('total')})"),
            ]
            
            all_checks_passed = True
            for check, desc in checks:
                if check:
                    print_pass(desc)
                else:
                    print_fail(desc)
                    all_checks_passed = False
            
            # Verify coupon usage incremented
            response = requests.get(
                f"{BASE_URL}/admin/coupons",
                cookies=admin_cookie,
                timeout=10
            )
            coupons = response.json().get('coupons', [])
            coupon = next((c for c in coupons if c.get('code') == 'ARKTEST10'), None)
            
            if coupon:
                used_after = coupon.get('used', 0)
                print_info(f"Coupon used count after order: {used_after}")
                
                if used_after == used_before + 1:
                    print_pass(f"Coupon usage incremented from {used_before} to {used_after}")
                else:
                    print_fail(f"Coupon usage not incremented correctly. Before: {used_before}, After: {used_after}")
                    all_checks_passed = False
            else:
                print_fail("Could not verify coupon usage - coupon not found")
                all_checks_passed = False
            
            return all_checks_passed
        else:
            print_fail(f"Order creation failed with status {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print_fail(f"Exception during order creation with coupon: {str(e)}")
        return False

# ============================================================================
# Test 8: Razorpay Init (Mocked)
# ============================================================================
def test_razorpay_init():
    print_test("7. POST /api/payments/razorpay/init - Razorpay Init (Mocked)")
    
    try:
        if not test_order_id:
            print_fail("No test order ID available")
            return False
        
        payment_data = {
            "orderId": test_order_id,
            "amount": 24500
        }
        
        response = requests.post(
            f"{BASE_URL}/payments/razorpay/init",
            json=payment_data,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            
            checks = [
                (data.get('ok') is True, "Response has ok: true"),
                (data.get('mocked') is True, "Response indicates mocked mode"),
                (data.get('amount') == 2450000, f"Amount in paise is correct (got {data.get('amount')})"),
                (data.get('orderId') == test_order_id, "Order ID echoed correctly")
            ]
            
            all_checks_passed = True
            for check, desc in checks:
                if check:
                    print_pass(desc)
                else:
                    print_fail(desc)
                    all_checks_passed = False
            
            print_info(f"Full response: {data}")
            return all_checks_passed
        else:
            print_fail(f"Razorpay init failed with status {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print_fail(f"Exception during Razorpay init: {str(e)}")
        return False

# ============================================================================
# Test 9: Razorpay Verify (Mocked)
# ============================================================================
def test_razorpay_verify():
    print_test("8. POST /api/payments/razorpay/verify - Razorpay Verify (Mocked)")
    
    try:
        if not test_order_id:
            print_fail("No test order ID available")
            return False
        
        verify_data = {
            "orderId": test_order_id
        }
        
        response = requests.post(
            f"{BASE_URL}/payments/razorpay/verify",
            json=verify_data,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            
            checks = [
                (data.get('ok') is True, "Response has ok: true"),
                (data.get('mocked') is True, "Response indicates mocked mode")
            ]
            
            all_checks_passed = True
            for check, desc in checks:
                if check:
                    print_pass(desc)
                else:
                    print_fail(desc)
                    all_checks_passed = False
            
            # Verify order payment status is still pending (not paid in mocked mode)
            response = requests.get(
                f"{BASE_URL}/admin/orders",
                cookies=admin_cookie,
                timeout=10
            )
            orders = response.json().get('orders', [])
            order = next((o for o in orders if o.get('id') == test_order_id), None)
            
            if order:
                payment_status = order.get('paymentStatus')
                print_info(f"Order payment status after verify: {payment_status}")
                
                if payment_status == 'pending':
                    print_pass("Payment status correctly remains 'pending' in mocked mode")
                else:
                    print_fail(f"Expected payment status 'pending', got '{payment_status}'")
                    all_checks_passed = False
            else:
                print_fail("Could not verify order payment status - order not found")
                all_checks_passed = False
            
            return all_checks_passed
        else:
            print_fail(f"Razorpay verify failed with status {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print_fail(f"Exception during Razorpay verify: {str(e)}")
        return False

# ============================================================================
# Test 10: Admin Inventory Endpoint
# ============================================================================
def test_admin_inventory():
    print_test("9. GET /api/admin/inventory?threshold=3 - Admin Inventory Summary")
    
    try:
        response = requests.get(
            f"{BASE_URL}/admin/inventory?threshold=3",
            cookies=admin_cookie,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            
            checks = [
                (data.get('threshold') == 3, "Threshold is 3"),
                ('totals' in data, "Response has totals"),
                ('products' in data, "Response has products array")
            ]
            
            all_checks_passed = True
            for check, desc in checks:
                if check:
                    print_pass(desc)
                else:
                    print_fail(desc)
                    all_checks_passed = False
            
            totals = data.get('totals', {})
            print_info(f"Totals: all={totals.get('all')}, outOfStock={totals.get('outOfStock')}, lowStock={totals.get('lowStock')}, healthy={totals.get('healthy')}")
            
            products = data.get('products', [])
            if products:
                # Verify products are sorted by stock ascending
                stocks = [p.get('stock', 0) for p in products]
                is_sorted = all(stocks[i] <= stocks[i+1] for i in range(len(stocks)-1))
                
                if is_sorted:
                    print_pass("Products sorted by stock ascending")
                else:
                    print_fail("Products not sorted correctly by stock")
                    all_checks_passed = False
                
                # Check if out-of-stock products are first
                first_product = products[0]
                print_info(f"First product: {first_product.get('name')} (stock: {first_product.get('stock')})")
            else:
                print_info("No products in inventory")
            
            return all_checks_passed
        else:
            print_fail(f"Admin inventory failed with status {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print_fail(f"Exception during admin inventory test: {str(e)}")
        return False

# ============================================================================
# Test 11: PATCH Product Stock
# ============================================================================
def test_patch_product_stock():
    print_test("10. PATCH /api/admin/products/:id/stock - Update Product Stock")
    
    try:
        if not test_product_id:
            print_fail("No test product ID available")
            return False
        
        # Set stock to 0
        print_info(f"Setting stock to 0 for product {test_product_id}")
        response = requests.patch(
            f"{BASE_URL}/admin/products/{test_product_id}/stock",
            json={"stock": 0},
            cookies=admin_cookie,
            timeout=10
        )
        
        if response.status_code != 200:
            print_fail(f"PATCH stock failed with status {response.status_code}: {response.text}")
            return False
        
        data = response.json()
        checks = [
            (data.get('ok') is True, "Response has ok: true"),
            (data.get('stock') == 0, "Stock set to 0"),
            (data.get('status') == 'out-of-stock', "Status set to 'out-of-stock'")
        ]
        
        all_checks_passed = True
        for check, desc in checks:
            if check:
                print_pass(desc)
            else:
                print_fail(desc)
                all_checks_passed = False
        
        # Verify via GET
        response = requests.get(
            f"{BASE_URL}/admin/products",
            cookies=admin_cookie,
            timeout=10
        )
        products = response.json().get('products', [])
        product = next((p for p in products if p.get('id') == test_product_id), None)
        
        if product:
            if product.get('stock') == 0 and product.get('status') == 'out-of-stock':
                print_pass("Verified stock=0 and status='out-of-stock' via GET")
            else:
                print_fail(f"Verification failed: stock={product.get('stock')}, status={product.get('status')}")
                all_checks_passed = False
        else:
            print_fail("Could not verify - product not found")
            all_checks_passed = False
        
        # Restore stock
        print_info(f"Restoring stock to 5 for product {test_product_id}")
        response = requests.patch(
            f"{BASE_URL}/admin/products/{test_product_id}/stock",
            json={"stock": 5, "status": "published"},
            cookies=admin_cookie,
            timeout=10
        )
        
        if response.status_code == 200:
            print_pass("Stock restored to 5")
        else:
            print_fail(f"Failed to restore stock: {response.status_code}")
            all_checks_passed = False
        
        return all_checks_passed
            
    except Exception as e:
        print_fail(f"Exception during PATCH stock test: {str(e)}")
        return False

# ============================================================================
# Test 12: Admin Dashboard
# ============================================================================
def test_admin_dashboard():
    print_test("11. GET /api/admin/dashboard - Admin Dashboard")
    
    try:
        response = requests.get(
            f"{BASE_URL}/admin/dashboard",
            cookies=admin_cookie,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            
            required_fields = ['products', 'active', 'outOfStock', 'orders', 'pending', 'subscribers', 'contacts', 'revenue']
            checks = [(field in data, f"Dashboard has '{field}' field") for field in required_fields]
            
            all_checks_passed = True
            for check, desc in checks:
                if check:
                    print_pass(desc)
                else:
                    print_fail(desc)
                    all_checks_passed = False
            
            print_info(f"Dashboard data: {data}")
            return all_checks_passed
        else:
            print_fail(f"Admin dashboard failed with status {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print_fail(f"Exception during admin dashboard test: {str(e)}")
        return False

# ============================================================================
# Test 13: Admin Orders
# ============================================================================
def test_admin_orders():
    print_test("12. GET /api/admin/orders - Admin Orders List")
    
    try:
        response = requests.get(
            f"{BASE_URL}/admin/orders",
            cookies=admin_cookie,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            
            if 'orders' in data:
                print_pass(f"Orders endpoint working, returned {len(data.get('orders', []))} orders")
                return True
            else:
                print_fail(f"Unexpected response format: {data}")
                return False
        else:
            print_fail(f"Admin orders failed with status {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print_fail(f"Exception during admin orders test: {str(e)}")
        return False

# ============================================================================
# Test 14: Admin Coupons
# ============================================================================
def test_admin_coupons():
    print_test("13. GET /api/admin/coupons - Admin Coupons List")
    
    try:
        response = requests.get(
            f"{BASE_URL}/admin/coupons",
            cookies=admin_cookie,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            
            if 'coupons' in data:
                print_pass(f"Coupons endpoint working, returned {len(data.get('coupons', []))} coupons")
                return True
            else:
                print_fail(f"Unexpected response format: {data}")
                return False
        else:
            print_fail(f"Admin coupons failed with status {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print_fail(f"Exception during admin coupons test: {str(e)}")
        return False

# ============================================================================
# Test 15: Admin Settings
# ============================================================================
def test_admin_settings():
    print_test("14. GET /api/admin/settings - Admin Settings")
    
    try:
        response = requests.get(
            f"{BASE_URL}/admin/settings",
            cookies=admin_cookie,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            
            if 'settings' in data:
                print_pass(f"Settings endpoint working: {data}")
                return True
            else:
                print_fail(f"Unexpected response format: {data}")
                return False
        else:
            print_fail(f"Admin settings failed with status {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print_fail(f"Exception during admin settings test: {str(e)}")
        return False

# ============================================================================
# Test 16: Newsletter Subscription
# ============================================================================
def test_newsletter():
    print_test("15. POST /api/newsletter - Newsletter Subscription")
    
    try:
        newsletter_data = {
            "email": "test.newsletter@example.com"
        }
        
        response = requests.post(
            f"{BASE_URL}/newsletter",
            json=newsletter_data,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            
            if data.get('ok') is True:
                print_pass("Newsletter subscription successful")
                return True
            else:
                print_fail(f"Unexpected response: {data}")
                return False
        else:
            print_fail(f"Newsletter subscription failed with status {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print_fail(f"Exception during newsletter test: {str(e)}")
        return False

# ============================================================================
# Test 17: Contact Form
# ============================================================================
def test_contact():
    print_test("16. POST /api/contact - Contact Form Submission")
    
    try:
        contact_data = {
            "email": "test.contact@example.com",
            "name": "Test User",
            "message": "This is a test contact message"
        }
        
        response = requests.post(
            f"{BASE_URL}/contact",
            json=contact_data,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            
            if data.get('ok') is True:
                print_pass("Contact form submission successful")
                return True
            else:
                print_fail(f"Unexpected response: {data}")
                return False
        else:
            print_fail(f"Contact form failed with status {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print_fail(f"Exception during contact test: {str(e)}")
        return False

# ============================================================================
# Test 18: Cleanup - Delete Test Coupon
# ============================================================================
def test_cleanup_coupon():
    print_test("17. DELETE /api/admin/coupons/:id - Cleanup Test Coupon")
    
    try:
        if not test_coupon_id:
            print_fail("No test coupon ID to cleanup")
            return False
        
        response = requests.delete(
            f"{BASE_URL}/admin/coupons/{test_coupon_id}",
            cookies=admin_cookie,
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            
            if data.get('ok') is True:
                print_pass(f"Test coupon {test_coupon_id} deleted successfully")
                return True
            else:
                print_fail(f"Unexpected response: {data}")
                return False
        else:
            print_fail(f"Coupon deletion failed with status {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print_fail(f"Exception during coupon cleanup: {str(e)}")
        return False

# ============================================================================
# Main Test Runner
# ============================================================================
def main():
    print("\n" + "="*80)
    print("ARKADHATRI BACKEND API TEST SUITE")
    print("="*80)
    print(f"Base URL: {BASE_URL}")
    print(f"Admin Email: {ADMIN_EMAIL}")
    print("="*80)
    
    results = {}
    
    # Run all tests in sequence
    tests = [
        ("Admin Login", test_admin_login),
        ("Admin /me", test_admin_me),
        ("Create Test Coupon", test_create_coupon),
        ("Coupon Validation", test_coupon_validation),
        ("Get Products", test_get_products),
        ("Order Without Coupon", test_order_without_coupon),
        ("Order With Coupon", test_order_with_coupon),
        ("Razorpay Init", test_razorpay_init),
        ("Razorpay Verify", test_razorpay_verify),
        ("Admin Inventory", test_admin_inventory),
        ("PATCH Product Stock", test_patch_product_stock),
        ("Admin Dashboard", test_admin_dashboard),
        ("Admin Orders", test_admin_orders),
        ("Admin Coupons", test_admin_coupons),
        ("Admin Settings", test_admin_settings),
        ("Newsletter", test_newsletter),
        ("Contact Form", test_contact),
        ("Cleanup Test Coupon", test_cleanup_coupon)
    ]
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            results[test_name] = result
        except Exception as e:
            print_fail(f"Unexpected error in {test_name}: {str(e)}")
            results[test_name] = False
    
    # Print summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    passed = sum(1 for r in results.values() if r)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    print("="*80)
    print(f"TOTAL: {passed}/{total} tests passed")
    print("="*80)
    
    return passed == total

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
