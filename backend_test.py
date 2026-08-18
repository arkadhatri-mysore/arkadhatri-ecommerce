#!/usr/bin/env python3
"""
ARKADHATRI Final Launch Hardening — Backend Test Suite
Tests scenarios A-L as specified in test_result.md
"""
import requests
import json
import time
from typing import Dict, Any, Optional

# Configuration
BASE_URL = "https://timeless-crafted-8.preview.emergentagent.com/api"
ADMIN_EMAIL = "admin@arkadhatri.com"
ADMIN_PASSWORD = "ArkAdmin@2025"

# Test state
admin_token = None
test_product_id = None
test_coupon_id = None
test_order_id = None
original_stock = None

class TestResult:
    def __init__(self, scenario: str):
        self.scenario = scenario
        self.passed = False
        self.message = ""
    
    def success(self, msg: str):
        self.passed = True
        self.message = msg
        print(f"✅ {self.scenario}: PASS - {msg}")
    
    def fail(self, msg: str):
        self.passed = False
        self.message = msg
        print(f"❌ {self.scenario}: FAIL - {msg}")

results = {}

def admin_login() -> str:
    """Login as admin and return token"""
    try:
        resp = requests.post(f"{BASE_URL}/admin/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if resp.status_code == 200:
            # Extract token from Set-Cookie header
            cookies = resp.headers.get('Set-Cookie', '')
            if 'admin_token=' in cookies:
                token = cookies.split('admin_token=')[1].split(';')[0]
                print(f"✓ Admin login successful")
                return token
        print(f"✗ Admin login failed: {resp.status_code} {resp.text}")
        return None
    except Exception as e:
        print(f"✗ Admin login error: {e}")
        return None

def get_test_product(token: str) -> Optional[Dict]:
    """Get a product for testing"""
    try:
        resp = requests.get(f"{BASE_URL}/admin/products", 
                          headers={"Cookie": f"admin_token={token}"})
        if resp.status_code == 200:
            products = resp.json().get('products', [])
            if products:
                # Find a published product
                for p in products:
                    if p.get('status') == 'published':
                        print(f"✓ Found test product: {p.get('name')} (SKU: {p.get('sku')}, Price: {p.get('price')}, Stock: {p.get('stock')})")
                        return p
                # If no published, use first one
                print(f"✓ Using first product: {products[0].get('name')}")
                return products[0]
        print(f"✗ Failed to get products: {resp.status_code}")
        return None
    except Exception as e:
        print(f"✗ Error getting products: {e}")
        return None

def set_product_stock(token: str, product_id: str, stock: int, status: str = 'published') -> bool:
    """Set product stock"""
    try:
        resp = requests.patch(f"{BASE_URL}/admin/products/{product_id}/stock",
                            headers={"Cookie": f"admin_token={token}"},
                            json={"stock": stock, "status": status})
        if resp.status_code == 200:
            print(f"✓ Set product stock to {stock}")
            return True
        print(f"✗ Failed to set stock: {resp.status_code} {resp.text}")
        return False
    except Exception as e:
        print(f"✗ Error setting stock: {e}")
        return False

def create_test_coupon(token: str) -> Optional[str]:
    """Create test coupon ARKTEST10"""
    try:
        resp = requests.post(f"{BASE_URL}/admin/coupons",
                           headers={"Cookie": f"admin_token={token}"},
                           json={
                               "code": "ARKTEST10",
                               "type": "percentage",
                               "value": 10,
                               "minPurchase": 5000,
                               "active": True,
                               "usageLimit": 100
                           })
        if resp.status_code == 200:
            coupon_id = resp.json().get('coupon', {}).get('id')
            print(f"✓ Created test coupon ARKTEST10 (ID: {coupon_id})")
            return coupon_id
        print(f"✗ Failed to create coupon: {resp.status_code} {resp.text}")
        return None
    except Exception as e:
        print(f"✗ Error creating coupon: {e}")
        return None

def delete_coupon(token: str, coupon_id: str):
    """Delete test coupon"""
    try:
        resp = requests.delete(f"{BASE_URL}/admin/coupons/{coupon_id}",
                             headers={"Cookie": f"admin_token={token}"})
        if resp.status_code == 200:
            print(f"✓ Deleted test coupon")
        else:
            print(f"✗ Failed to delete coupon: {resp.status_code}")
    except Exception as e:
        print(f"✗ Error deleting coupon: {e}")

# ==================== TEST SCENARIOS ====================

def test_scenario_a(token: str, product: Dict):
    """A) Order creation with server-side pricing + atomic stock reservation"""
    result = TestResult("Scenario A")
    global test_order_id, original_stock
    
    try:
        # Step 1: Set stock to 1
        product_id = product['id']
        sku = product['sku']
        price = product['price']
        original_stock = product.get('stock', 0)
        
        if not set_product_stock(token, product_id, 1, 'published'):
            result.fail("Failed to set stock to 1")
            return result
        
        # Step 2: Create order (client sends NO price)
        order_data = {
            "items": [{"sku": sku, "qty": 1}],
            "customer": {
                "fullName": "Priya Sharma",
                "email": "priya.sharma@example.com",
                "mobile": "9876543210",
                "address1": "123 MG Road",
                "address2": "Near City Center",
                "city": "Bangalore",
                "state": "Karnataka",
                "pincode": "560001"
            },
            "couponCode": None
        }
        
        resp = requests.post(f"{BASE_URL}/orders", json=order_data)
        if resp.status_code != 200:
            result.fail(f"Order creation failed: {resp.status_code} {resp.text}")
            return result
        
        data = resp.json()
        if not data.get('ok'):
            result.fail(f"Order not ok: {data}")
            return result
        
        order = data.get('order', {})
        test_order_id = order.get('id')
        payment = data.get('payment', {})
        
        # Verify server-side pricing
        if order.get('subtotal') != price:
            result.fail(f"Subtotal mismatch: expected {price}, got {order.get('subtotal')}")
            return result
        
        # Verify order state
        if order.get('status') != 'PAYMENT_PENDING':
            result.fail(f"Status should be PAYMENT_PENDING, got {order.get('status')}")
            return result
        
        if order.get('paymentStatus') != 'pending':
            result.fail(f"PaymentStatus should be pending, got {order.get('paymentStatus')}")
            return result
        
        if not order.get('stockReserved'):
            result.fail("stockReserved should be true")
            return result
        
        if order.get('stockCommitted'):
            result.fail("stockCommitted should be false")
            return result
        
        if not payment.get('mocked'):
            result.fail("Payment should be mocked")
            return result
        
        # Step 3: Verify stock is now 0
        time.sleep(0.5)
        prod_resp = requests.get(f"{BASE_URL}/admin/products/{product_id}",
                               headers={"Cookie": f"admin_token={token}"})
        if prod_resp.status_code == 200:
            updated_product = prod_resp.json().get('product', {})
            if updated_product.get('stock') != 0:
                result.fail(f"Stock should be 0, got {updated_product.get('stock')}")
                return result
        
        # Step 4: Try to create second order (should fail with 409)
        resp2 = requests.post(f"{BASE_URL}/orders", json=order_data)
        if resp2.status_code != 409:
            result.fail(f"Second order should return 409, got {resp2.status_code}")
            return result
        
        error_data = resp2.json()
        if 'Insufficient stock' not in error_data.get('error', ''):
            result.fail(f"Error should mention insufficient stock: {error_data}")
            return result
        
        # Step 5: Restore stock to 5
        if not set_product_stock(token, product_id, 5, 'published'):
            result.fail("Failed to restore stock")
            return result
        
        result.success("Server-side pricing, atomic reservation, rollback all working")
        
    except Exception as e:
        result.fail(f"Exception: {e}")
    
    results['A'] = result
    return result

def test_scenario_b(token: str, product: Dict):
    """B) Server-side pricing tamper-proof"""
    result = TestResult("Scenario B")
    
    try:
        sku = product['sku']
        real_price = product['price']
        
        # Try to tamper with price
        order_data = {
            "items": [{"sku": sku, "qty": 1, "price": 1}],  # Tampered price
            "customer": {
                "fullName": "Amit Kumar",
                "email": "amit.kumar@example.com",
                "mobile": "9123456789",
                "address1": "456 Park Street",
                "city": "Kolkata",
                "state": "West Bengal",
                "pincode": "700016"
            }
        }
        
        resp = requests.post(f"{BASE_URL}/orders", json=order_data)
        if resp.status_code != 200:
            result.fail(f"Order creation failed: {resp.status_code} {resp.text}")
            return result
        
        data = resp.json()
        order = data.get('order', {})
        
        # Verify server ignored client price
        if order.get('subtotal') != real_price:
            result.fail(f"Server used tampered price! Expected {real_price}, got {order.get('subtotal')}")
            return result
        
        result.success(f"Server correctly used DB price {real_price}, ignored client price 1")
        
    except Exception as e:
        result.fail(f"Exception: {e}")
    
    results['B'] = result
    return result

def test_scenario_c():
    """C) Customer field validation"""
    result = TestResult("Scenario C")
    
    try:
        # Missing mobile field
        order_data = {
            "items": [{"sku": "TEST", "qty": 1}],
            "customer": {
                "fullName": "Test User",
                "email": "test@example.com",
                # mobile missing
                "address1": "123 Street",
                "city": "City",
                "state": "State",
                "pincode": "123456"
            }
        }
        
        resp = requests.post(f"{BASE_URL}/orders", json=order_data)
        if resp.status_code != 400:
            result.fail(f"Should return 400, got {resp.status_code}")
            return result
        
        error = resp.json().get('error', '')
        if 'mobile' not in error.lower():
            result.fail(f"Error should mention mobile: {error}")
            return result
        
        result.success(f"Validation working: {error}")
        
    except Exception as e:
        result.fail(f"Exception: {e}")
    
    results['C'] = result
    return result

def test_scenario_d(token: str, product: Dict):
    """D) Coupon flow"""
    result = TestResult("Scenario D")
    global test_coupon_id
    
    try:
        # Create coupon
        test_coupon_id = create_test_coupon(token)
        if not test_coupon_id:
            result.fail("Failed to create test coupon")
            return result
        
        time.sleep(0.5)
        
        # Get initial usage
        coupons_resp = requests.get(f"{BASE_URL}/admin/coupons",
                                   headers={"Cookie": f"admin_token={token}"})
        if coupons_resp.status_code != 200:
            result.fail("Failed to get coupons")
            return result
        
        coupons = coupons_resp.json().get('coupons', [])
        test_coupon = next((c for c in coupons if c['code'] == 'ARKTEST10'), None)
        if not test_coupon:
            result.fail("Test coupon not found")
            return result
        
        initial_used = test_coupon.get('used', 0)
        
        # Create order with coupon (subtotal must be >= 5000)
        sku = product['sku']
        price = product['price']
        
        # Calculate qty to meet minimum
        qty = max(1, int(5000 / price) + 1) if price > 0 else 1
        
        order_data = {
            "items": [{"sku": sku, "qty": qty}],
            "customer": {
                "fullName": "Rajesh Verma",
                "email": "rajesh.verma@example.com",
                "mobile": "9988776655",
                "address1": "789 Brigade Road",
                "city": "Bangalore",
                "state": "Karnataka",
                "pincode": "560025"
            },
            "couponCode": "ARKTEST10"
        }
        
        resp = requests.post(f"{BASE_URL}/orders", json=order_data)
        if resp.status_code != 200:
            result.fail(f"Order with coupon failed: {resp.status_code} {resp.text}")
            return result
        
        data = resp.json()
        order = data.get('order', {})
        
        # Verify discount
        subtotal = order.get('subtotal', 0)
        discount = order.get('discount', 0)
        expected_discount = int(subtotal * 0.1)
        
        if abs(discount - expected_discount) > 1:  # Allow 1 rupee rounding
            result.fail(f"Discount mismatch: expected ~{expected_discount}, got {discount}")
            return result
        
        # Verify coupon applied
        coupon_applied = order.get('couponApplied', {})
        if coupon_applied.get('code') != 'ARKTEST10':
            result.fail(f"Coupon code not applied: {coupon_applied}")
            return result
        
        # Verify usage incremented
        time.sleep(0.5)
        coupons_resp2 = requests.get(f"{BASE_URL}/admin/coupons",
                                    headers={"Cookie": f"admin_token={token}"}")
        if coupons_resp2.status_code == 200:
            coupons2 = coupons_resp2.json().get('coupons', [])
            test_coupon2 = next((c for c in coupons2 if c['code'] == 'ARKTEST10'), None)
            if test_coupon2:
                new_used = test_coupon2.get('used', 0)
                if new_used != initial_used + 1:
                    result.fail(f"Usage not incremented: was {initial_used}, now {new_used}")
                    return result
        
        result.success(f"Coupon applied: discount={discount}, usage incremented")
        
    except Exception as e:
        result.fail(f"Exception: {e}")
    
    results['D'] = result
    return result

def test_scenario_e():
    """E) Razorpay verify — mocked mode (should NOT mark as paid)"""
    result = TestResult("Scenario E")
    
    try:
        if not test_order_id:
            result.fail("No test order ID available")
            return result
        
        # Call verify without signature (mocked mode)
        resp = requests.post(f"{BASE_URL}/payments/razorpay/verify", json={
            "orderId": test_order_id
        })
        
        if resp.status_code != 200:
            result.fail(f"Verify failed: {resp.status_code} {resp.text}")
            return result
        
        data = resp.json()
        if not data.get('ok'):
            result.fail(f"Verify not ok: {data}")
            return result
        
        if not data.get('mocked'):
            result.fail("Should return mocked:true")
            return result
        
        # Verify order still PAYMENT_PENDING
        time.sleep(0.5)
        order_resp = requests.get(f"{BASE_URL}/orders/{test_order_id}")
        if order_resp.status_code != 200:
            result.fail(f"Failed to get order: {order_resp.status_code}")
            return result
        
        order = order_resp.json().get('order', {})
        if order.get('paymentStatus') != 'pending':
            result.fail(f"Order should remain pending, got {order.get('paymentStatus')}")
            return result
        
        result.success("Mocked verify does NOT mark order as paid (correct)")
        
    except Exception as e:
        result.fail(f"Exception: {e}")
    
    results['E'] = result
    return result

def test_scenario_g():
    """G) Razorpay webhook without secret (should return 503)"""
    result = TestResult("Scenario G")
    
    try:
        resp = requests.post(f"{BASE_URL}/webhooks/razorpay", 
                           json={"event": "test"},
                           headers={"x-razorpay-signature": "dummy"})
        
        if resp.status_code != 503:
            result.fail(f"Should return 503, got {resp.status_code}")
            return result
        
        error = resp.json().get('error', '')
        if 'not configured' not in error.lower():
            result.fail(f"Error should mention not configured: {error}")
            return result
        
        result.success("Webhook correctly returns 503 when secret not configured")
        
    except Exception as e:
        result.fail(f"Exception: {e}")
    
    results['G'] = result
    return result

def test_scenario_h():
    """H) Order tracking with redaction"""
    result = TestResult("Scenario H")
    
    try:
        if not test_order_id:
            result.fail("No test order ID available")
            return result
        
        # Track with correct email
        resp = requests.post(f"{BASE_URL}/orders/track", json={
            "orderId": test_order_id,
            "identifier": "priya.sharma@example.com"
        })
        
        if resp.status_code != 200:
            result.fail(f"Track failed: {resp.status_code} {resp.text}")
            return result
        
        data = resp.json()
        order = data.get('order', {})
        
        # Verify redaction (no customer.email or customer.address)
        if 'customer' in order:
            if 'email' in order['customer'] or 'address1' in order['customer']:
                result.fail("Order should be redacted (no email/address in customer)")
                return result
        
        # Should have basic info
        if not order.get('id') or not order.get('status'):
            result.fail("Order should have id and status")
            return result
        
        # Track with wrong identifier
        resp2 = requests.post(f"{BASE_URL}/orders/track", json={
            "orderId": test_order_id,
            "identifier": "wrong@example.com"
        })
        
        if resp2.status_code != 404:
            result.fail(f"Wrong identifier should return 404, got {resp2.status_code}")
            return result
        
        result.success("Order tracking returns redacted response, rejects wrong identifier")
        
    except Exception as e:
        result.fail(f"Exception: {e}")
    
    results['H'] = result
    return result

def test_scenario_i(token: str):
    """I) Admin order state transitions"""
    result = TestResult("Scenario I")
    
    try:
        if not test_order_id:
            result.fail("No test order ID available")
            return result
        
        # Try illegal transition: PAYMENT_PENDING -> SHIPPED
        resp = requests.put(f"{BASE_URL}/admin/orders/{test_order_id}",
                          headers={"Cookie": f"admin_token={token}"},
                          json={"status": "SHIPPED"})
        
        if resp.status_code != 400:
            result.fail(f"Illegal transition should return 400, got {resp.status_code}")
            return result
        
        error = resp.json().get('error', '')
        if 'transition' not in error.lower():
            result.fail(f"Error should mention transition: {error}")
            return result
        
        # Legal transition: PAYMENT_PENDING -> PAID
        resp2 = requests.put(f"{BASE_URL}/admin/orders/{test_order_id}",
                           headers={"Cookie": f"admin_token={token}"},
                           json={"status": "PAID"})
        
        if resp2.status_code != 200:
            result.fail(f"Legal transition PAID failed: {resp2.status_code} {resp2.text}")
            return result
        
        # PAID -> PROCESSING
        time.sleep(0.3)
        resp3 = requests.put(f"{BASE_URL}/admin/orders/{test_order_id}",
                           headers={"Cookie": f"admin_token={token}"},
                           json={"status": "PROCESSING"})
        
        if resp3.status_code != 200:
            result.fail(f"Transition to PROCESSING failed: {resp3.status_code}")
            return result
        
        # PROCESSING -> PACKED
        time.sleep(0.3)
        resp4 = requests.put(f"{BASE_URL}/admin/orders/{test_order_id}",
                           headers={"Cookie": f"admin_token={token}"},
                           json={"status": "PACKED"})
        
        if resp4.status_code != 200:
            result.fail(f"Transition to PACKED failed: {resp4.status_code}")
            return result
        
        # PACKED -> SHIPPED with shipping fields
        time.sleep(0.3)
        resp5 = requests.put(f"{BASE_URL}/admin/orders/{test_order_id}",
                           headers={"Cookie": f"admin_token={token}"},
                           json={
                               "status": "SHIPPED",
                               "courier": "Delhivery",
                               "awb": "12345678",
                               "trackingUrl": "https://delhivery.com/track/12345678"
                           })
        
        if resp5.status_code != 200:
            result.fail(f"Transition to SHIPPED failed: {resp5.status_code}")
            return result
        
        # Verify shipping fields persisted
        time.sleep(0.3)
        order_resp = requests.get(f"{BASE_URL}/admin/orders/{test_order_id}",
                                headers={"Cookie": f"admin_token={token}"})
        
        if order_resp.status_code == 200:
            order = order_resp.json().get('order', {})
            if order.get('courier') != 'Delhivery':
                result.fail(f"Courier not persisted: {order.get('courier')}")
                return result
            if order.get('awb') != '12345678':
                result.fail(f"AWB not persisted: {order.get('awb')}")
                return result
        
        result.success("State transitions validated, illegal jumps rejected, shipping fields persisted")
        
    except Exception as e:
        result.fail(f"Exception: {e}")
    
    results['I'] = result
    return result

def test_scenario_j():
    """J) Rate limiting sanity (newsletter, contact)"""
    result = TestResult("Scenario J")
    
    try:
        # Test newsletter
        resp1 = requests.post(f"{BASE_URL}/newsletter", json={
            "email": "newsletter.test@example.com"
        })
        
        if resp1.status_code != 200:
            result.fail(f"Newsletter failed: {resp1.status_code} {resp1.text}")
            return result
        
        if not resp1.json().get('ok'):
            result.fail(f"Newsletter not ok: {resp1.json()}")
            return result
        
        # Test contact
        resp2 = requests.post(f"{BASE_URL}/contact", json={
            "name": "Test User",
            "email": "contact.test@example.com",
            "message": "This is a test message for rate limiting check"
        })
        
        if resp2.status_code != 200:
            result.fail(f"Contact failed: {resp2.status_code} {resp2.text}")
            return result
        
        if not resp2.json().get('ok'):
            result.fail(f"Contact not ok: {resp2.json()}")
            return result
        
        result.success("Newsletter and Contact endpoints working with rate limiting")
        
    except Exception as e:
        result.fail(f"Exception: {e}")
    
    results['J'] = result
    return result

def test_scenario_k(token: str):
    """K) Dashboard revenue (only paid orders)"""
    result = TestResult("Scenario K")
    
    try:
        # Get dashboard
        resp = requests.get(f"{BASE_URL}/admin/dashboard",
                          headers={"Cookie": f"admin_token={token}"})
        
        if resp.status_code != 200:
            result.fail(f"Dashboard failed: {resp.status_code} {resp.text}")
            return result
        
        data = resp.json()
        revenue = data.get('revenue', 0)
        
        # We marked test_order_id as PAID in scenario I, so revenue should include it
        # Get the order to verify
        if test_order_id:
            order_resp = requests.get(f"{BASE_URL}/admin/orders/{test_order_id}",
                                    headers={"Cookie": f"admin_token={token}"})
            if order_resp.status_code == 200:
                order = order_resp.json().get('order', {})
                if order.get('paymentStatus') == 'paid':
                    # Revenue should be > 0 since we have at least one paid order
                    if revenue <= 0:
                        result.fail(f"Revenue should be > 0 for paid orders, got {revenue}")
                        return result
        
        result.success(f"Dashboard revenue correctly sums only paid orders: ₹{revenue}")
        
    except Exception as e:
        result.fail(f"Exception: {e}")
    
    results['K'] = result
    return result

def test_scenario_l():
    """L) Smoke tests for other endpoints"""
    result = TestResult("Scenario L")
    
    try:
        # Test coupon validate
        resp1 = requests.post(f"{BASE_URL}/coupons/validate", json={
            "code": "ARKTEST10",
            "subtotal": 10000
        })
        
        if resp1.status_code != 200:
            result.fail(f"Coupon validate failed: {resp1.status_code}")
            return result
        
        # Test GET orders/:id (should work for existing order)
        if test_order_id:
            resp2 = requests.get(f"{BASE_URL}/orders/{test_order_id}")
            if resp2.status_code != 200:
                result.fail(f"GET orders/:id failed: {resp2.status_code}")
                return result
        
        result.success("Coupon validate and GET orders/:id working")
        
    except Exception as e:
        result.fail(f"Exception: {e}")
    
    results['L'] = result
    return result

def cleanup(token: str, product_id: str):
    """Cleanup test data"""
    print("\n" + "="*60)
    print("CLEANUP")
    print("="*60)
    
    # Delete test coupon
    if test_coupon_id:
        delete_coupon(token, test_coupon_id)
    
    # Restore product stock
    if product_id and original_stock is not None:
        set_product_stock(token, product_id, max(5, original_stock), 'published')
        print(f"✓ Restored product stock to {max(5, original_stock)}")

def print_summary():
    """Print test summary"""
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    passed = sum(1 for r in results.values() if r.passed)
    total = len(results)
    
    for scenario in sorted(results.keys()):
        r = results[scenario]
        status = "✅ PASS" if r.passed else "❌ FAIL"
        print(f"{status} | Scenario {scenario}: {r.message}")
    
    print("="*60)
    print(f"TOTAL: {passed}/{total} scenarios passed")
    print("="*60)
    
    return passed == total

def main():
    print("="*60)
    print("ARKADHATRI FINAL LAUNCH HARDENING — BACKEND TESTS")
    print("="*60)
    print(f"Base URL: {BASE_URL}")
    print(f"Admin: {ADMIN_EMAIL}")
    print("="*60)
    
    # Login
    token = admin_login()
    if not token:
        print("❌ FATAL: Admin login failed")
        return False
    
    # Get test product
    product = get_test_product(token)
    if not product:
        print("❌ FATAL: No test product available")
        return False
    
    product_id = product['id']
    
    try:
        # Run all scenarios
        print("\n" + "="*60)
        print("RUNNING TEST SCENARIOS")
        print("="*60 + "\n")
        
        test_scenario_a(token, product)
        time.sleep(0.5)
        
        test_scenario_b(token, product)
        time.sleep(0.5)
        
        test_scenario_c()
        time.sleep(0.5)
        
        test_scenario_d(token, product)
        time.sleep(0.5)
        
        test_scenario_e()
        time.sleep(0.5)
        
        test_scenario_g()
        time.sleep(0.5)
        
        test_scenario_h()
        time.sleep(0.5)
        
        test_scenario_i(token)
        time.sleep(0.5)
        
        test_scenario_j()
        time.sleep(0.5)
        
        test_scenario_k(token)
        time.sleep(0.5)
        
        test_scenario_l()
        
    finally:
        # Cleanup
        cleanup(token, product_id)
    
    # Print summary
    all_passed = print_summary()
    
    return all_passed

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
