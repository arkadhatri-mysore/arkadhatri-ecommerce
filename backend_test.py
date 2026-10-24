#!/usr/bin/env python3
"""
Backend test for ARKADHATRI admin security + email + refund endpoints.
Tests password management, email templates, and Razorpay refund (key-independent behavior).
"""

import requests
import json
import sys
from typing import Dict, Optional

# Base URL from review request
BASE_URL = "http://localhost:3000/api"

# Admin credentials
ADMIN_EMAIL = "admin@arkadhatri.com"
ADMIN_PASSWORD = "ArkAdmin@2025"

# Test results tracking
test_results = []

def log_test(name: str, passed: bool, details: str = ""):
    """Log test result"""
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"{status}: {name}")
    if details:
        print(f"  Details: {details}")
    test_results.append({"name": name, "passed": passed, "details": details})

def admin_login(ip_suffix: str = "1") -> Optional[str]:
    """Login as admin and return session cookie. Use unique IP to avoid rate limiting."""
    try:
        headers = {"X-Forwarded-For": f"10.50.0.{ip_suffix}"}
        resp = requests.post(
            f"{BASE_URL}/admin/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
            headers=headers,
            timeout=10
        )
        if resp.status_code == 200:
            cookie = resp.cookies.get("ark_admin")
            if cookie:
                return cookie
        print(f"Login failed: {resp.status_code} - {resp.text[:200]}")
        return None
    except Exception as e:
        print(f"Login error: {e}")
        return None

def test_password_change():
    """Test 1: Password change flow with validation and session revocation"""
    print("\n=== TEST 1: PASSWORD CHANGE ===")
    
    # Get initial session
    cookie1 = admin_login("10")
    if not cookie1:
        log_test("Password change - initial login", False, "Could not login")
        return
    log_test("Password change - initial login", True)
    
    # Test 1a: Wrong current password
    try:
        resp = requests.post(
            f"{BASE_URL}/admin/password",
            json={"currentPassword": "WrongPassword123", "newPassword": "TempArk2026Secure"},
            cookies={"ark_admin": cookie1},
            headers={"X-Forwarded-For": "10.50.0.11"},
            timeout=10
        )
        passed = resp.status_code == 400 and "incorrect" in resp.text.lower()
        log_test("Password change - wrong current password returns 400", passed, 
                f"Status: {resp.status_code}, Body: {resp.text[:100]}")
    except Exception as e:
        log_test("Password change - wrong current password returns 400", False, str(e))
    
    # Test 1b: Weak passwords (short, no number, no uppercase)
    weak_passwords = [
        ("short", "Short password"),
        ("nouppercase123", "No uppercase"),
        ("NOLOWERCASE123", "No lowercase"),
        ("NoNumbers", "No numbers")
    ]
    
    for weak_pw, desc in weak_passwords:
        try:
            resp = requests.post(
                f"{BASE_URL}/admin/password",
                json={"currentPassword": ADMIN_PASSWORD, "newPassword": weak_pw},
                cookies={"ark_admin": cookie1},
                headers={"X-Forwarded-For": "10.50.0.12"},
                timeout=10
            )
            passed = resp.status_code == 400
            log_test(f"Password change - weak password rejected ({desc})", passed,
                    f"Status: {resp.status_code}")
        except Exception as e:
            log_test(f"Password change - weak password rejected ({desc})", False, str(e))
    
    # Test 1c: Success with strong temp password
    temp_password = "TempArk2026Secure"
    try:
        resp = requests.post(
            f"{BASE_URL}/admin/password",
            json={"currentPassword": ADMIN_PASSWORD, "newPassword": temp_password},
            cookies={"ark_admin": cookie1},
            headers={"X-Forwarded-For": "10.50.0.13"},
            timeout=10
        )
        passed = resp.status_code == 200
        new_cookie = resp.cookies.get("ark_admin")
        log_test("Password change - success with strong password", passed,
                f"Status: {resp.status_code}, New cookie: {bool(new_cookie)}")
        
        if passed and new_cookie:
            # Test 1d: Old session should now get 401
            try:
                resp = requests.get(
                    f"{BASE_URL}/admin/me",
                    cookies={"ark_admin": cookie1},
                    timeout=10
                )
                passed = resp.status_code == 401
                log_test("Password change - old session revoked (401)", passed,
                        f"Status: {resp.status_code}")
            except Exception as e:
                log_test("Password change - old session revoked (401)", False, str(e))
            
            # Test 1e: Login with old password should fail
            try:
                resp = requests.post(
                    f"{BASE_URL}/admin/login",
                    json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
                    headers={"X-Forwarded-For": "10.50.0.14"},
                    timeout=10
                )
                passed = resp.status_code == 401
                log_test("Password change - old password rejected", passed,
                        f"Status: {resp.status_code}")
            except Exception as e:
                log_test("Password change - old password rejected", False, str(e))
            
            # Test 1f: Login with new password should work
            try:
                resp = requests.post(
                    f"{BASE_URL}/admin/login",
                    json={"email": ADMIN_EMAIL, "password": temp_password},
                    headers={"X-Forwarded-For": "10.50.0.15"},
                    timeout=10
                )
                passed = resp.status_code == 200
                restore_cookie = resp.cookies.get("ark_admin")
                log_test("Password change - new password works", passed,
                        f"Status: {resp.status_code}")
                
                # RESTORE: Change password back to original
                if passed and restore_cookie:
                    try:
                        resp = requests.post(
                            f"{BASE_URL}/admin/password",
                            json={"currentPassword": temp_password, "newPassword": ADMIN_PASSWORD},
                            cookies={"ark_admin": restore_cookie},
                            headers={"X-Forwarded-For": "10.50.0.16"},
                            timeout=10
                        )
                        passed = resp.status_code == 200
                        log_test("Password RESTORE - back to ArkAdmin@2025", passed,
                                f"Status: {resp.status_code}")
                        
                        # Verify original password works
                        if passed:
                            resp = requests.post(
                                f"{BASE_URL}/admin/login",
                                json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
                                headers={"X-Forwarded-For": "10.50.0.17"},
                                timeout=10
                            )
                            passed = resp.status_code == 200
                            log_test("Password RESTORE - original password verified", passed,
                                    f"Status: {resp.status_code}")
                    except Exception as e:
                        log_test("Password RESTORE - back to ArkAdmin@2025", False, str(e))
            except Exception as e:
                log_test("Password change - new password works", False, str(e))
    except Exception as e:
        log_test("Password change - success with strong password", False, str(e))

def test_forgot_reset():
    """Test 2: Forgot/reset password flow"""
    print("\n=== TEST 2: FORGOT/RESET PASSWORD ===")
    
    # Test 2a: Forgot with admin email -> 503 (SMTP missing)
    try:
        resp = requests.post(
            f"{BASE_URL}/admin/password/forgot",
            json={"email": ADMIN_EMAIL},
            headers={"X-Forwarded-For": "10.50.0.20"},
            timeout=10
        )
        passed = resp.status_code == 503 and "email" in resp.text.lower()
        log_test("Forgot password - admin email returns 503 (SMTP missing)", passed,
                f"Status: {resp.status_code}, Body: {resp.text[:150]}")
    except Exception as e:
        log_test("Forgot password - admin email returns 503 (SMTP missing)", False, str(e))
    
    # Test 2b: Forgot with other email -> 200 generic
    try:
        resp = requests.post(
            f"{BASE_URL}/admin/password/forgot",
            json={"email": "other@example.com"},
            headers={"X-Forwarded-For": "10.50.0.21"},
            timeout=10
        )
        passed = resp.status_code == 200
        log_test("Forgot password - other email returns 200 generic", passed,
                f"Status: {resp.status_code}")
    except Exception as e:
        log_test("Forgot password - other email returns 200 generic", False, str(e))
    
    # Test 2c: Rate limiting - 4th request within window -> 429
    try:
        # Use same IP for rate limit test
        ip = "10.50.0.22"
        for i in range(3):
            requests.post(
                f"{BASE_URL}/admin/password/forgot",
                json={"email": "test@example.com"},
                headers={"X-Forwarded-For": ip},
                timeout=10
            )
        
        # 4th request should be rate limited
        resp = requests.post(
            f"{BASE_URL}/admin/password/forgot",
            json={"email": "test@example.com"},
            headers={"X-Forwarded-For": ip},
            timeout=10
        )
        passed = resp.status_code == 429
        log_test("Forgot password - 4th request returns 429 (rate limited)", passed,
                f"Status: {resp.status_code}")
    except Exception as e:
        log_test("Forgot password - 4th request returns 429 (rate limited)", False, str(e))
    
    # Test 2d: Reset with invalid token -> 400
    try:
        resp = requests.post(
            f"{BASE_URL}/admin/password/reset",
            json={"token": "invalid-token-12345", "newPassword": "ValidPassword123"},
            headers={"X-Forwarded-For": "10.50.0.23"},
            timeout=10
        )
        passed = resp.status_code == 400 and ("invalid" in resp.text.lower() or "expired" in resp.text.lower())
        log_test("Reset password - invalid token returns 400", passed,
                f"Status: {resp.status_code}, Body: {resp.text[:100]}")
    except Exception as e:
        log_test("Reset password - invalid token returns 400", False, str(e))
    
    # Test 2e: Reset with weak password -> 400
    try:
        resp = requests.post(
            f"{BASE_URL}/admin/password/reset",
            json={"token": "some-token", "newPassword": "weak"},
            headers={"X-Forwarded-For": "10.50.0.24"},
            timeout=10
        )
        passed = resp.status_code == 400
        log_test("Reset password - weak password returns 400", passed,
                f"Status: {resp.status_code}")
    except Exception as e:
        log_test("Reset password - weak password returns 400", False, str(e))

def test_email_endpoints():
    """Test 3: Email status, preview, and test endpoints"""
    print("\n=== TEST 3: EMAIL ENDPOINTS ===")
    
    # Get admin session
    cookie = admin_login("30")
    if not cookie:
        log_test("Email endpoints - admin login", False, "Could not login")
        return
    
    # Test 3a: GET /admin/email/status without auth -> 401
    try:
        resp = requests.get(f"{BASE_URL}/admin/email/status", timeout=10)
        passed = resp.status_code == 401
        log_test("Email status - 401 without cookie", passed,
                f"Status: {resp.status_code}")
    except Exception as e:
        log_test("Email status - 401 without cookie", False, str(e))
    
    # Test 3b: GET /admin/email/status with auth -> configured:false + 8 templates
    try:
        resp = requests.get(
            f"{BASE_URL}/admin/email/status",
            cookies={"ark_admin": cookie},
            timeout=10
        )
        passed = resp.status_code == 200
        if passed:
            data = resp.json()
            configured = data.get("configured", True)
            templates = data.get("templates", [])
            passed = configured == False and len(templates) == 8
            log_test("Email status - returns configured:false + 8 templates", passed,
                    f"configured={configured}, templates={len(templates)}")
        else:
            log_test("Email status - returns configured:false + 8 templates", False,
                    f"Status: {resp.status_code}")
    except Exception as e:
        log_test("Email status - returns configured:false + 8 templates", False, str(e))
    
    # Test 3c: GET /admin/email/preview/<template> for each of 8 templates
    templates = [
        "order-confirmation", "payment-receipt", "payment-failed",
        "order-shipped", "order-delivered", "refund-initiated",
        "refund-processed", "admin-password-reset"
    ]
    
    for template in templates:
        try:
            resp = requests.get(
                f"{BASE_URL}/admin/email/preview/{template}",
                cookies={"ark_admin": cookie},
                timeout=10
            )
            passed = resp.status_code == 200 and resp.headers.get("content-type", "").startswith("text/html")
            if passed:
                html = resp.text
                passed = "ARKADHATRI" in html
            log_test(f"Email preview - {template} returns 200 text/html with ARKADHATRI", passed,
                    f"Status: {resp.status_code}, Has ARKADHATRI: {'ARKADHATRI' in resp.text if resp.status_code == 200 else False}")
        except Exception as e:
            log_test(f"Email preview - {template} returns 200 text/html with ARKADHATRI", False, str(e))
    
    # Test 3d: GET /admin/email/preview/unknown -> 404
    try:
        resp = requests.get(
            f"{BASE_URL}/admin/email/preview/unknown-template",
            cookies={"ark_admin": cookie},
            timeout=10
        )
        passed = resp.status_code == 404
        log_test("Email preview - unknown template returns 404", passed,
                f"Status: {resp.status_code}")
    except Exception as e:
        log_test("Email preview - unknown template returns 404", False, str(e))
    
    # Test 3e: POST /admin/email/test -> 503 (SMTP missing)
    try:
        resp = requests.post(
            f"{BASE_URL}/admin/email/test",
            json={"template": "order-confirmation"},
            cookies={"ark_admin": cookie},
            timeout=10
        )
        passed = resp.status_code == 503 and "not configured" in resp.text.lower()
        log_test("Email test - returns 503 (SMTP missing)", passed,
                f"Status: {resp.status_code}, Body: {resp.text[:100]}")
    except Exception as e:
        log_test("Email test - returns 503 (SMTP missing)", False, str(e))
    
    # Test 3f: POST /admin/email/test without auth -> 401
    try:
        resp = requests.post(
            f"{BASE_URL}/admin/email/test",
            json={"template": "order-confirmation"},
            timeout=10
        )
        passed = resp.status_code == 401
        log_test("Email test - 401 without cookie", passed,
                f"Status: {resp.status_code}")
    except Exception as e:
        log_test("Email test - 401 without cookie", False, str(e))

def test_refund_endpoint():
    """Test 4: Refund endpoint"""
    print("\n=== TEST 4: REFUND ENDPOINT ===")
    
    # Get admin session
    cookie = admin_login("40")
    if not cookie:
        log_test("Refund - admin login", False, "Could not login")
        return
    
    # Test 4a: POST /admin/orders/:id/refund without auth -> 401
    try:
        resp = requests.post(
            f"{BASE_URL}/admin/orders/nonexistent-id/refund",
            json={"amount": 100},
            timeout=10
        )
        passed = resp.status_code == 401
        log_test("Refund - 401 without cookie", passed,
                f"Status: {resp.status_code}")
    except Exception as e:
        log_test("Refund - 401 without cookie", False, str(e))
    
    # Test 4b: POST /admin/orders/nonexistent/refund -> 404
    try:
        resp = requests.post(
            f"{BASE_URL}/admin/orders/nonexistent-order-id/refund",
            json={"amount": 100},
            cookies={"ark_admin": cookie},
            timeout=10
        )
        passed = resp.status_code == 404
        log_test("Refund - nonexistent order returns 404", passed,
                f"Status: {resp.status_code}")
    except Exception as e:
        log_test("Refund - nonexistent order returns 404", False, str(e))
    
    # Test 4c: Get an existing order and try refund -> 503 (Razorpay not configured)
    try:
        # Get list of orders
        resp = requests.get(
            f"{BASE_URL}/admin/orders",
            cookies={"ark_admin": cookie},
            timeout=10
        )
        if resp.status_code == 200:
            orders = resp.json().get("orders", [])
            if orders:
                order_id = orders[0]["id"]
                log_test("Refund - found existing order", True, f"Order ID: {order_id}")
                
                # Try to refund
                resp = requests.post(
                    f"{BASE_URL}/admin/orders/{order_id}/refund",
                    json={"amount": 100},
                    cookies={"ark_admin": cookie},
                    timeout=10
                )
                passed = resp.status_code == 503 and "razorpay" in resp.text.lower() and "not configured" in resp.text.lower()
                log_test("Refund - existing order returns 503 (Razorpay not configured)", passed,
                        f"Status: {resp.status_code}, Body: {resp.text[:150]}")
            else:
                log_test("Refund - found existing order", False, "No orders found")
        else:
            log_test("Refund - found existing order", False, f"Could not get orders: {resp.status_code}")
    except Exception as e:
        log_test("Refund - existing order returns 503 (Razorpay not configured)", False, str(e))

def test_quick_regression():
    """Test 5: Quick regression tests"""
    print("\n=== TEST 5: QUICK REGRESSION ===")
    
    # Test 5a: GET /api/health -> 200
    try:
        resp = requests.get(f"{BASE_URL}/health", timeout=10)
        passed = resp.status_code == 200
        if passed:
            data = resp.json()
            passed = data.get("ok") == True
        log_test("Regression - GET /api/health returns 200", passed,
                f"Status: {resp.status_code}")
    except Exception as e:
        log_test("Regression - GET /api/health returns 200", False, str(e))
    
    # Test 5b: GET /api/catalog -> 200
    try:
        resp = requests.get(f"{BASE_URL}/catalog", timeout=10)
        passed = resp.status_code == 200
        if passed:
            data = resp.json()
            products = data.get("products", [])
            passed = isinstance(products, list)
        log_test("Regression - GET /api/catalog returns 200", passed,
                f"Status: {resp.status_code}, Products: {len(products) if passed else 0}")
    except Exception as e:
        log_test("Regression - GET /api/catalog returns 200", False, str(e))
    
    # Test 5c: GET /api/admin/products with auth -> 200
    cookie = admin_login("50")
    if cookie:
        try:
            resp = requests.get(
                f"{BASE_URL}/admin/products",
                cookies={"ark_admin": cookie},
                timeout=10
            )
            passed = resp.status_code == 200
            if passed:
                data = resp.json()
                products = data.get("products", [])
                passed = isinstance(products, list)
            log_test("Regression - GET /api/admin/products returns 200", passed,
                    f"Status: {resp.status_code}, Products: {len(products) if passed else 0}")
        except Exception as e:
            log_test("Regression - GET /api/admin/products returns 200", False, str(e))
    else:
        log_test("Regression - GET /api/admin/products returns 200", False, "Could not login")

def main():
    """Run all tests"""
    print("=" * 80)
    print("ARKADHATRI BACKEND TEST - Admin Security + Email + Refund")
    print("=" * 80)
    
    try:
        # Run all test suites
        test_password_change()
        test_forgot_reset()
        test_email_endpoints()
        test_refund_endpoint()
        test_quick_regression()
        
        # Summary
        print("\n" + "=" * 80)
        print("TEST SUMMARY")
        print("=" * 80)
        
        total = len(test_results)
        passed = sum(1 for t in test_results if t["passed"])
        failed = total - passed
        
        print(f"\nTotal: {total} tests")
        print(f"Passed: {passed} ✅")
        print(f"Failed: {failed} ❌")
        
        if failed > 0:
            print("\nFailed tests:")
            for t in test_results:
                if not t["passed"]:
                    print(f"  ❌ {t['name']}")
                    if t["details"]:
                        print(f"     {t['details']}")
        
        print("\n" + "=" * 80)
        
        # Exit with appropriate code
        sys.exit(0 if failed == 0 else 1)
        
    except Exception as e:
        print(f"\n❌ FATAL ERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
