#!/usr/bin/env python3
"""
Security Regression Test - ARKADHATRI
Scenarios: A-F (unauthorized order access, OTP, admin reset, rate limits, trusted proxy, smoke)
"""
import requests
import time
import json
from pymongo import MongoClient
from uuid import uuid4
from datetime import datetime, timedelta
import os
import sys

# Configuration
INTERNAL_URL = "http://localhost:3000/api"
EXTERNAL_URL = os.getenv("NEXT_PUBLIC_BASE_URL", "https://timeless-crafted-8.preview.emergentagent.com") + "/api"
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "your_database_name")
ADMIN_EMAIL = "admin@arkadhatri.com"
ADMIN_PASSWORD = "ArkAdmin@2025"

# Test data
TEST_EMAIL = "otp-test@example.com"
TEST_MOBILE = "+919800000001"

def log(msg):
    print(f"[TEST] {msg}")

def backup_admin_data(db):
    """Backup admin_users and admin_reset_tokens"""
    admin_users = list(db.admin_users.find({}))
    admin_reset_tokens = list(db.admin_reset_tokens.find({}))
    log(f"✅ Backed up {len(admin_users)} admin_users and {len(admin_reset_tokens)} admin_reset_tokens")
    return {"admin_users": admin_users, "admin_reset_tokens": admin_reset_tokens}

def restore_admin_data(db, backup):
    """Restore admin_users and admin_reset_tokens exactly"""
    db.admin_users.delete_many({})
    db.admin_reset_tokens.delete_many({})
    if backup["admin_users"]:
        db.admin_users.insert_many(backup["admin_users"])
    if backup["admin_reset_tokens"]:
        db.admin_reset_tokens.insert_many(backup["admin_reset_tokens"])
    log(f"✅ Restored {len(backup['admin_users'])} admin_users and {len(backup['admin_reset_tokens'])} admin_reset_tokens")

def verify_admin_login(email, password):
    """Verify admin can login with given credentials"""
    resp = requests.post(f"{INTERNAL_URL}/admin/login", json={"email": email, "password": password})
    return resp.status_code == 200

def create_test_order(db, order_id=None):
    """Insert a test order directly into MongoDB"""
    if not order_id:
        order_id = str(uuid4())
    
    order = {
        "id": order_id,
        "customer": {
            "fullName": "Test Customer",
            "email": TEST_EMAIL,
            "mobile": TEST_MOBILE,
            "address1": "123 Test St",
            "city": "Mumbai",
            "state": "Maharashtra",
            "pincode": "400001"
        },
        "items": [{
            "sku": "TEST-SEC-001",
            "name": "Test Saree",
            "qty": 1,
            "price": 5000,
            "image": ""
        }],
        "total": 5000,
        "subtotal": 5000,
        "shipping": 0,
        "discount": 0,
        "status": "PAYMENT_PENDING",
        "paymentStatus": "pending",
        "adminNote": "INTERNAL SECRET NOTE",
        "needsRefundReview": True,
        "razorpayPaymentId": "pay_test",
        "razorpayOrderId": "order_test",
        "_id": order_id,
        "createdAt": datetime.utcnow()
    }
    db.orders.insert_one(order)
    log(f"✅ Created test order: {order_id[:8]}")
    return order_id

def cleanup_test_data(db, order_ids):
    """Clean up test orders and related data"""
    if order_ids:
        db.orders.delete_many({"id": {"$in": order_ids}})
        log(f"✅ Deleted {len(order_ids)} test orders")
    
    # Clean up mock_outbox
    db.mock_outbox.delete_many({"to": TEST_EMAIL})
    log("✅ Cleaned up mock_outbox")
    
    # Clean up order_otps
    db.order_otps.delete_many({})
    log("✅ Cleaned up order_otps")

def cleanup_rate_limits(db, patterns):
    """Clean up rate limit keys matching patterns"""
    for pattern in patterns:
        db.rate_limits.delete_many({"_id": {"$regex": pattern}})
    log(f"✅ Cleaned up rate_limits for {len(patterns)} patterns")

def scenario_a_unauthorized_order_access(db):
    """A. Unauthorized order access"""
    log("\n=== SCENARIO A: Unauthorized Order Access ===")
    
    # Create two test orders
    order_a_id = create_test_order(db)
    order_b_id = create_test_order(db)
    
    try:
        # A1: GET /orders/<id> without cookie -> 401 VERIFY_REQUIRED, no PII
        log("A1: GET /orders/<id> without cookie")
        resp = requests.get(f"{INTERNAL_URL}/orders/{order_a_id}")
        assert resp.status_code == 401, f"Expected 401, got {resp.status_code}"
        data = resp.json()
        assert data.get("code") == "VERIFY_REQUIRED", f"Expected VERIFY_REQUIRED, got {data.get('code')}"
        assert "email" not in str(data).lower() or TEST_EMAIL not in str(data), "PII leaked in 401 response"
        log("✅ A1 PASS: 401 VERIFY_REQUIRED without cookie, no PII")
        
        # A2: POST /orders/track without session -> 401
        log("A2: POST /orders/track without session")
        resp = requests.post(f"{INTERNAL_URL}/orders/track", json={"orderId": order_a_id})
        assert resp.status_code == 401, f"Expected 401, got {resp.status_code}"
        log("✅ A2 PASS: POST /orders/track returns 401 without session")
        
        # A3: POST /payments/razorpay/init without session -> 401
        log("A3: POST /payments/razorpay/init without session")
        resp = requests.post(f"{INTERNAL_URL}/payments/razorpay/init", json={"orderId": order_a_id})
        assert resp.status_code == 401, f"Expected 401, got {resp.status_code}"
        log("✅ A3 PASS: POST /payments/razorpay/init returns 401 without session")
        
        # A4: POST /payments/razorpay/verify without session -> 401
        log("A4: POST /payments/razorpay/verify without session")
        resp = requests.post(f"{INTERNAL_URL}/payments/razorpay/verify", json={"orderId": order_a_id})
        assert resp.status_code == 401, f"Expected 401, got {resp.status_code}"
        log("✅ A4 PASS: POST /payments/razorpay/verify returns 401 without session")
        
        # A5: Verify order A, then try to access order B -> 401 (session scoped to one order)
        log("A5: Verify order A, then try to access order B")
        # Request OTP for order A
        resp = requests.post(f"{INTERNAL_URL}/orders/access/request", json={
            "orderNumber": order_a_id[:8],
            "contact": TEST_EMAIL
        })
        assert resp.status_code == 200, f"OTP request failed: {resp.status_code}"
        time.sleep(1)
        
        # Get OTP from mock_outbox
        otp_doc = db.mock_outbox.find_one({"to": TEST_EMAIL}, sort=[("createdAt", -1)])
        assert otp_doc, "No OTP email found in mock_outbox"
        otp_code = None
        for match in [otp_doc.get("subject", ""), otp_doc.get("html", "")]:
            import re
            codes = re.findall(r'\b\d{6}\b', str(match))
            if codes:
                otp_code = codes[0]
                break
        assert otp_code, "Could not extract OTP code from email"
        
        # Verify OTP for order A
        resp = requests.post(f"{INTERNAL_URL}/orders/access/verify", json={
            "orderNumber": order_a_id[:8],
            "code": otp_code
        })
        assert resp.status_code == 200, f"OTP verify failed: {resp.status_code}"
        cookies = resp.cookies
        
        # Try to access order B with order A's session
        resp = requests.get(f"{INTERNAL_URL}/orders/{order_b_id}", cookies=cookies)
        assert resp.status_code == 401, f"Expected 401 for cross-order access, got {resp.status_code}"
        log("✅ A5 PASS: Session scoped to one order (cannot access order B with order A session)")
        
        # A6: Verified response must NOT contain sensitive fields
        log("A6: Verified response must NOT contain sensitive fields")
        resp = requests.get(f"{INTERNAL_URL}/orders/{order_a_id}", cookies=cookies)
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        data = resp.json()
        order_data = data.get("order", {})
        
        # Check that sensitive fields are NOT present
        sensitive_fields = ["adminNote", "needsRefundReview", "stockConflict", "razorpayPaymentId", "razorpayOrderId", "_id"]
        for field in sensitive_fields:
            assert field not in order_data, f"Sensitive field '{field}' leaked in response"
        log("✅ A6 PASS: Verified response does NOT contain sensitive fields")
        
        log("✅ SCENARIO A: ALL PASS")
        return True
        
    finally:
        cleanup_test_data(db, [order_a_id, order_b_id])

def scenario_b_otp(db):
    """B. OTP (email-based order access)"""
    log("\n=== SCENARIO B: OTP ===")
    
    order_id = create_test_order(db)
    
    try:
        # B1: Request OTP with matching email -> generic response
        log("B1: Request OTP with matching email")
        resp = requests.post(f"{INTERNAL_URL}/orders/access/request", json={
            "orderNumber": order_id[:8],
            "contact": TEST_EMAIL
        })
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        data = resp.json()
        assert data.get("ok") == True, "Expected ok:true"
        assert "6-digit code" in data.get("message", ""), "Generic message not returned"
        log("✅ B1 PASS: Generic response for matching email")
        
        time.sleep(1)
        
        # B2: Check OTP in mock_outbox (6 digits)
        log("B2: Check OTP in mock_outbox")
        otp_doc = db.mock_outbox.find_one({"to": TEST_EMAIL}, sort=[("createdAt", -1)])
        assert otp_doc, "No OTP email found in mock_outbox"
        import re
        otp_code = None
        for match in [otp_doc.get("subject", ""), otp_doc.get("html", "")]:
            codes = re.findall(r'\b\d{6}\b', str(match))
            if codes:
                otp_code = codes[0]
                break
        assert otp_code and len(otp_code) == 6, f"Invalid OTP code: {otp_code}"
        log(f"✅ B2 PASS: OTP code found in mock_outbox (6 digits)")
        
        # B3: Check order_otps stores only codeHash (no plain code)
        log("B3: Check order_otps stores only codeHash")
        otp_record = db.order_otps.find_one({"_id": order_id})
        assert otp_record, "No OTP record found in order_otps"
        assert "codeHash" in otp_record, "codeHash not found in order_otps"
        assert otp_code not in str(otp_record), "Plain OTP code leaked in order_otps"
        log("✅ B3 PASS: order_otps stores only codeHash (no plain code)")
        
        # B4: Verify OTP -> 200 + Set-Cookie ark_order (HttpOnly)
        log("B4: Verify OTP")
        resp = requests.post(f"{INTERNAL_URL}/orders/access/verify", json={
            "orderNumber": order_id[:8],
            "code": otp_code
        })
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        assert "ark_order" in resp.headers.get("Set-Cookie", ""), "ark_order cookie not set"
        assert "HttpOnly" in resp.headers.get("Set-Cookie", ""), "HttpOnly not set on cookie"
        log("✅ B4 PASS: OTP verify returns 200 + Set-Cookie ark_order (HttpOnly)")
        
        # B5: Reuse same code -> 400
        log("B5: Reuse same code")
        resp = requests.post(f"{INTERNAL_URL}/orders/access/verify", json={
            "orderNumber": order_id[:8],
            "code": otp_code
        })
        assert resp.status_code == 400, f"Expected 400 for reused code, got {resp.status_code}"
        log("✅ B5 PASS: Reused code returns 400")
        
        # B6: Wrong code 5 times -> then even correct code fails
        log("B6: Wrong code 5 times -> attempt limit")
        # Request new OTP
        time.sleep(2)  # Wait for cooldown
        resp = requests.post(f"{INTERNAL_URL}/orders/access/request", json={
            "orderNumber": order_id[:8],
            "contact": TEST_EMAIL
        })
        assert resp.status_code == 200, f"OTP request failed: {resp.status_code}"
        time.sleep(1)
        
        # Get new OTP
        otp_doc = db.mock_outbox.find_one({"to": TEST_EMAIL}, sort=[("createdAt", -1)])
        new_otp_code = None
        for match in [otp_doc.get("subject", ""), otp_doc.get("html", "")]:
            codes = re.findall(r'\b\d{6}\b', str(match))
            if codes:
                new_otp_code = codes[0]
                break
        
        # Try wrong code 5 times
        for i in range(5):
            resp = requests.post(f"{INTERNAL_URL}/orders/access/verify", json={
                "orderNumber": order_id[:8],
                "code": "000000"
            })
            log(f"  Wrong attempt {i+1}/5: {resp.status_code}")
        
        # Now try correct code -> should fail due to attempt limit
        resp = requests.post(f"{INTERNAL_URL}/orders/access/verify", json={
            "orderNumber": order_id[:8],
            "code": new_otp_code
        })
        assert resp.status_code == 400, f"Expected 400 after 5 wrong attempts, got {resp.status_code}"
        log("✅ B6 PASS: Correct code fails after 5 wrong attempts")
        
        # B7: Resend within 60s -> no new mail (cooldown)
        log("B7: Resend within 60s -> cooldown")
        # Request OTP again immediately
        resp = requests.post(f"{INTERNAL_URL}/orders/access/request", json={
            "orderNumber": order_id[:8],
            "contact": TEST_EMAIL
        })
        assert resp.status_code == 200, "Expected 200 (generic response)"
        
        # Check that no new email was sent (count should be same)
        mail_count_before = db.mock_outbox.count_documents({"to": TEST_EMAIL})
        time.sleep(1)
        resp = requests.post(f"{INTERNAL_URL}/orders/access/request", json={
            "orderNumber": order_id[:8],
            "contact": TEST_EMAIL
        })
        mail_count_after = db.mock_outbox.count_documents({"to": TEST_EMAIL})
        assert mail_count_after == mail_count_before, "New email sent during cooldown"
        log("✅ B7 PASS: No new mail sent during 60s cooldown")
        
        # B8: After 60s (or set lastSentAt back) -> new code works, old doesn't
        log("B8: After cooldown -> new code works, old doesn't")
        # Clean up rate limits to avoid 429
        cleanup_rate_limits(db, ["^otp-send:", "^otp-verify:"])
        
        # Set lastSentAt back in DB to simulate 60s passing
        db.order_otps.update_one(
            {"_id": order_id},
            {"$set": {"lastSentAt": datetime.utcnow() - timedelta(seconds=61), "attempts": 0}}
        )
        
        # Request new OTP
        resp = requests.post(f"{INTERNAL_URL}/orders/access/request", json={
            "orderNumber": order_id[:8],
            "contact": TEST_EMAIL
        })
        assert resp.status_code == 200, f"OTP request failed: {resp.status_code}"
        time.sleep(1)
        
        # Get newest OTP
        otp_doc = db.mock_outbox.find_one({"to": TEST_EMAIL}, sort=[("createdAt", -1)])
        newest_otp_code = None
        for match in [otp_doc.get("subject", ""), otp_doc.get("html", "")]:
            codes = re.findall(r'\b\d{6}\b', str(match))
            if codes:
                newest_otp_code = codes[0]
                break
        
        # Old code should not work
        if new_otp_code != newest_otp_code:
            resp = requests.post(f"{INTERNAL_URL}/orders/access/verify", json={
                "orderNumber": order_id[:8],
                "code": new_otp_code
            })
            assert resp.status_code == 400, f"Old code should fail, got {resp.status_code}"
            log("  ✓ Old code rejected")
        
        # New code should work
        resp = requests.post(f"{INTERNAL_URL}/orders/access/verify", json={
            "orderNumber": order_id[:8],
            "code": newest_otp_code
        })
        assert resp.status_code == 200, f"New code should work, got {resp.status_code}"
        log("✅ B8 PASS: After cooldown, new code works and old code doesn't")
        
        # B9: Expiry test
        log("B9: Expired code rejected")
        # Clean up rate limits
        cleanup_rate_limits(db, ["^otp-send:", "^otp-verify:"])
        
        # Request new OTP
        time.sleep(2)
        resp = requests.post(f"{INTERNAL_URL}/orders/access/request", json={
            "orderNumber": order_id[:8],
            "contact": TEST_EMAIL
        })
        time.sleep(1)
        
        # Get OTP
        otp_doc = db.mock_outbox.find_one({"to": TEST_EMAIL}, sort=[("createdAt", -1)])
        expired_otp_code = None
        for match in [otp_doc.get("subject", ""), otp_doc.get("html", "")]:
            codes = re.findall(r'\b\d{6}\b', str(match))
            if codes:
                expired_otp_code = codes[0]
                break
        
        # Set expiresAt in past
        db.order_otps.update_one(
            {"_id": order_id},
            {"$set": {"expiresAt": datetime.utcnow() - timedelta(seconds=1)}}
        )
        
        # Try to verify expired code
        resp = requests.post(f"{INTERNAL_URL}/orders/access/verify", json={
            "orderNumber": order_id[:8],
            "code": expired_otp_code
        })
        assert resp.status_code == 400, f"Expected 400 for expired code, got {resp.status_code}"
        log("✅ B9 PASS: Expired code rejected")
        
        # B10: Phone contact -> 503 SMS_UNAVAILABLE
        log("B10: Phone contact -> 503 SMS_UNAVAILABLE")
        resp = requests.post(f"{INTERNAL_URL}/orders/access/request", json={
            "orderNumber": order_id[:8],
            "contact": TEST_MOBILE
        })
        assert resp.status_code == 503, f"Expected 503 for phone, got {resp.status_code}"
        data = resp.json()
        assert data.get("code") == "SMS_UNAVAILABLE", f"Expected SMS_UNAVAILABLE, got {data.get('code')}"
        log("✅ B10 PASS: Phone contact returns 503 SMS_UNAVAILABLE")
        
        # B11: Request with non-matching email -> generic response, no mail
        log("B11: Non-matching email -> generic response, no mail")
        mail_count_before = db.mock_outbox.count_documents({})
        resp = requests.post(f"{INTERNAL_URL}/orders/access/request", json={
            "orderNumber": order_id[:8],
            "contact": "wrong@example.com"
        })
        assert resp.status_code == 200, f"Expected 200 (generic), got {resp.status_code}"
        time.sleep(1)
        mail_count_after = db.mock_outbox.count_documents({})
        assert mail_count_after == mail_count_before, "Email sent for non-matching contact"
        log("✅ B11 PASS: Non-matching email returns generic response, no mail sent")
        
        log("✅ SCENARIO B: ALL PASS")
        return True
        
    finally:
        cleanup_test_data(db, [order_id])

def scenario_c_admin_reset(db):
    """C. Admin reset"""
    log("\n=== SCENARIO C: Admin Reset ===")
    
    # Clean up rate limits first (including account-level limits)
    cleanup_rate_limits(db, [
        "^admin-login:ip:",
        "^admin-login:acct:",
        "^admin-forgot:ip:",
        "^admin-forgot:acct",
        "^admin-reset:ip:",
        "^admin-pw:"
    ])
    
    # Backup admin data
    backup = backup_admin_data(db)
    
    try:
        # C1: Login first to get session S1
        log("C1: Login to get session S1")
        resp = requests.post(f"{INTERNAL_URL}/admin/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert resp.status_code == 200, f"Admin login failed: {resp.status_code}"
        s1_cookies = resp.cookies
        log("✅ C1 PASS: Admin login successful, session S1 obtained")
        
        # C2: POST /admin/password/forgot with wrong email -> 200 generic
        log("C2: Forgot password with wrong email")
        resp = requests.post(f"{INTERNAL_URL}/admin/password/forgot", json={
            "email": "wrong@example.com"
        })
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        data = resp.json()
        assert data.get("ok") == True, "Expected ok:true"
        log("✅ C2 PASS: Wrong email returns 200 generic response")
        
        # C3: POST /admin/password/forgot with correct email -> 200 generic, mail inserted
        log("C3: Forgot password with correct email")
        mail_count_before = db.mock_outbox.count_documents({"to": ADMIN_EMAIL})
        resp = requests.post(f"{INTERNAL_URL}/admin/password/forgot", json={
            "email": ADMIN_EMAIL
        })
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        time.sleep(1)
        mail_count_after = db.mock_outbox.count_documents({"to": ADMIN_EMAIL})
        assert mail_count_after > mail_count_before, "No reset email sent"
        log("✅ C3 PASS: Correct email returns 200 generic, reset email sent")
        
        # C4: Extract token from email
        log("C4: Extract reset token from email")
        reset_email = db.mock_outbox.find_one({"to": ADMIN_EMAIL}, sort=[("createdAt", -1)])
        assert reset_email, "No reset email found"
        import re
        token_match = re.search(r'/admin/reset-password\?token=([^"\s]+)', reset_email.get("html", ""))
        assert token_match, "Reset token not found in email"
        reset_token = token_match.group(1)
        log(f"✅ C4 PASS: Reset token extracted")
        
        # C5: Check admin_reset_tokens stores tokenHash only
        log("C5: Check admin_reset_tokens stores tokenHash only")
        token_record = db.admin_reset_tokens.find_one({})
        assert token_record, "No token record found"
        assert "tokenHash" in token_record, "tokenHash not found"
        assert reset_token not in str(token_record), "Plain token leaked in database"
        log("✅ C5 PASS: admin_reset_tokens stores tokenHash only")
        
        # C6: POST /admin/password/reset with token -> 200
        log("C6: Reset password with token")
        new_password = "TempReset#2026x"
        resp = requests.post(f"{INTERNAL_URL}/admin/password/reset", json={
            "token": reset_token,
            "newPassword": new_password
        })
        assert resp.status_code == 200, f"Password reset failed: {resp.status_code}"
        log("✅ C6 PASS: Password reset successful")
        
        # C7: Reuse same token -> 400
        log("C7: Reuse same token")
        resp = requests.post(f"{INTERNAL_URL}/admin/password/reset", json={
            "token": reset_token,
            "newPassword": "AnotherPassword123"
        })
        assert resp.status_code == 400, f"Expected 400 for reused token, got {resp.status_code}"
        log("✅ C7 PASS: Reused token returns 400")
        
        # C8: S1 cookie on GET /admin/me -> 401 (sessions invalidated)
        log("C8: Old session S1 invalidated")
        resp = requests.get(f"{INTERNAL_URL}/admin/me", cookies=s1_cookies)
        assert resp.status_code == 401, f"Expected 401 for old session, got {resp.status_code}"
        log("✅ C8 PASS: Old session S1 invalidated after password reset")
        
        # C9: Check notification mail "password was reset"
        log("C9: Check notification email")
        time.sleep(1)
        notification_email = db.mock_outbox.find_one(
            {"to": ADMIN_EMAIL, "subject": {"$regex": "password", "$options": "i"}},
            sort=[("createdAt", -1)]
        )
        assert notification_email, "No password reset notification email found"
        log("✅ C9 PASS: Password reset notification email sent")
        
        # C10: Expired token test
        log("C10: Expired token rejected")
        # Request another reset
        resp = requests.post(f"{INTERNAL_URL}/admin/password/forgot", json={
            "email": ADMIN_EMAIL
        })
        time.sleep(1)
        
        # Get new token
        reset_email = db.mock_outbox.find_one({"to": ADMIN_EMAIL}, sort=[("createdAt", -1)])
        token_match = re.search(r'/admin/reset-password\?token=([^"\s]+)', reset_email.get("html", ""))
        expired_token = token_match.group(1) if token_match else None
        
        # Set expiresAt in past
        db.admin_reset_tokens.update_many({}, {"$set": {"expiresAt": datetime.utcnow() - timedelta(seconds=1)}})
        
        # Try to use expired token
        resp = requests.post(f"{INTERNAL_URL}/admin/password/reset", json={
            "token": expired_token,
            "newPassword": "AnotherPassword123"
        })
        assert resp.status_code == 400, f"Expected 400 for expired token, got {resp.status_code}"
        log("✅ C10 PASS: Expired token rejected")
        
        # C11: Change password POST /admin/password requires correct currentPassword
        log("C11: Change password requires correct currentPassword")
        # Login with new password
        resp = requests.post(f"{INTERNAL_URL}/admin/login", json={
            "email": ADMIN_EMAIL,
            "password": new_password
        })
        assert resp.status_code == 200, f"Login with new password failed: {resp.status_code}"
        new_cookies = resp.cookies
        
        # Try to change password with wrong current password
        resp = requests.post(f"{INTERNAL_URL}/admin/password", 
            json={
                "currentPassword": "WrongPassword123",
                "newPassword": "AnotherPassword123"
            },
            cookies=new_cookies
        )
        assert resp.status_code == 400, f"Expected 400 for wrong current password, got {resp.status_code}"
        log("✅ C11 PASS: Wrong current password returns 400")
        
        log("✅ SCENARIO C: ALL PASS")
        return True
        
    finally:
        # CRITICAL: Restore admin data
        restore_admin_data(db, backup)
        
        # Verify original password works
        log("Verifying original password works after restore...")
        assert verify_admin_login(ADMIN_EMAIL, ADMIN_PASSWORD), "CRITICAL: Original password does not work after restore!"
        log("✅ CRITICAL: Original admin password verified working after restore")
        
        # Clean up mock_outbox
        db.mock_outbox.delete_many({"to": ADMIN_EMAIL})

def scenario_d_rate_limits(db):
    """D. Rate limits"""
    log("\n=== SCENARIO D: Rate Limits ===")
    
    # Clean up any existing rate limits first
    cleanup_rate_limits(db, [
        "^admin-login:ip:",
        "^otp-send:",
        "^otp-verify:"
    ])
    
    try:
        # D1: Admin login wrong password repeatedly -> 429 after 8 per IP
        log("D1: Admin login rate limit (8 per IP)")
        ip = "192.168.1.100"
        for i in range(9):
            resp = requests.post(f"{INTERNAL_URL}/admin/login", 
                json={"email": ADMIN_EMAIL, "password": "WrongPassword123"},
                headers={"X-Forwarded-For": ip}
            )
            log(f"  Attempt {i+1}/9: {resp.status_code}")
            if i < 8:
                assert resp.status_code == 401, f"Expected 401 for attempt {i+1}, got {resp.status_code}"
            else:
                assert resp.status_code == 429, f"Expected 429 for attempt {i+1}, got {resp.status_code}"
        log("✅ D1 PASS: Admin login rate limited after 8 attempts")
        
        # D2: OTP send limits (5/contact, 5/order, 10/IP per 15 min)
        log("D2: OTP send rate limits")
        
        # Test contact limit (5 per 15 min) - use different orders for each request
        ip2 = "192.168.1.101"
        for i in range(6):
            order_id = create_test_order(db)
            resp = requests.post(f"{INTERNAL_URL}/orders/access/request",
                json={"orderNumber": order_id[:8], "contact": TEST_EMAIL},
                headers={"X-Forwarded-For": ip2}
            )
            log(f"  Contact limit attempt {i+1}/6: {resp.status_code}")
            if i < 5:
                assert resp.status_code == 200, f"Expected 200 for attempt {i+1}, got {resp.status_code}"
            else:
                assert resp.status_code == 429, f"Expected 429 for attempt {i+1}, got {resp.status_code}"
            cleanup_test_data(db, [order_id])
        
        log("✅ D2 PASS: OTP send rate limits working")
        
        # D3: OTP verify limits -> 429
        log("D3: OTP verify rate limits")
        order_id = create_test_order(db)
        
        # Request OTP first
        resp = requests.post(f"{INTERNAL_URL}/orders/access/request",
            json={"orderNumber": order_id[:8], "contact": TEST_EMAIL}
        )
        time.sleep(1)
        
        # Try to verify with wrong code many times
        ip3 = "192.168.1.102"
        for i in range(21):
            resp = requests.post(f"{INTERNAL_URL}/orders/access/verify",
                json={"orderNumber": order_id[:8], "code": "000000"},
                headers={"X-Forwarded-For": ip3}
            )
            if i < 20:
                assert resp.status_code in [400, 429], f"Expected 400 or 429 for attempt {i+1}, got {resp.status_code}"
            else:
                assert resp.status_code == 429, f"Expected 429 for attempt {i+1}, got {resp.status_code}"
        
        cleanup_test_data(db, [order_id])
        log("✅ D3 PASS: OTP verify rate limits working")
        
        # D4: Restart persistence test
        log("D4: Rate limit persistence after restart")
        # Hit a limit
        ip4 = "192.168.1.103"
        for i in range(9):
            resp = requests.post(f"{INTERNAL_URL}/admin/login",
                json={"email": ADMIN_EMAIL, "password": "WrongPassword123"},
                headers={"X-Forwarded-For": ip4}
            )
        
        # Verify we're blocked
        resp = requests.post(f"{INTERNAL_URL}/admin/login",
            json={"email": ADMIN_EMAIL, "password": "WrongPassword123"},
            headers={"X-Forwarded-For": ip4}
        )
        assert resp.status_code == 429, f"Expected 429 before restart, got {resp.status_code}"
        
        # Restart nextjs
        log("  Restarting nextjs service...")
        os.system("sudo supervisorctl restart nextjs")
        time.sleep(15)  # Wait for restart
        
        # Try again - should still be blocked (counter persisted in DB)
        resp = requests.post(f"{INTERNAL_URL}/admin/login",
            json={"email": ADMIN_EMAIL, "password": "WrongPassword123"},
            headers={"X-Forwarded-For": ip4}
        )
        assert resp.status_code == 429, f"Expected 429 after restart (persistence), got {resp.status_code}"
        log("✅ D4 PASS: Rate limits persist after restart")
        
        log("✅ SCENARIO D: ALL PASS")
        return True
        
    finally:
        # Clean up rate_limits
        cleanup_rate_limits(db, [
            "^admin-login:ip:",
            "^otp-send:ip:",
            "^otp-send:contact:",
            "^otp-send:order:",
            "^otp-verify:ip:",
            "^otp-verify:order:"
        ])

def scenario_e_trusted_proxy(db):
    """E. Trusted proxy (TRUSTED_PROXY_HOPS=2)"""
    log("\n=== SCENARIO E: Trusted Proxy ===")
    
    # Clean up rate limits first (including account-level)
    cleanup_rate_limits(db, ["^admin-login:ip:", "^admin-login:acct:"])
    
    try:
        # E1: Hit admin login with spoofed X-Forwarded-For -> still blocked after 8
        log("E1: Trusted proxy ignores spoofed X-Forwarded-For")
        
        # Try with different spoofed IPs (should all be treated as same real IP)
        for i in range(9):
            spoofed_ip = f"9.9.9.{i}"
            resp = requests.post(f"{EXTERNAL_URL}/admin/login",
                json={"email": ADMIN_EMAIL, "password": "WrongPassword123"},
                headers={"X-Forwarded-For": spoofed_ip}
            )
            log(f"  Attempt {i+1}/9 with spoofed IP {spoofed_ip}: {resp.status_code}")
            if i < 8:
                assert resp.status_code == 401, f"Expected 401 for attempt {i+1}, got {resp.status_code}"
            else:
                assert resp.status_code == 429, f"Expected 429 for attempt {i+1}, got {resp.status_code}"
        
        log("✅ E1 PASS: Spoofed X-Forwarded-For ignored, real client IP used for rate limiting")
        
        # E2: Check rate_limits _id keys use real egress IP, not spoofed
        log("E2: Check rate_limits keys use real IP")
        rate_limit_keys = list(db.rate_limits.find({"_id": {"$regex": "^admin-login:ip:"}}))
        for key_doc in rate_limit_keys:
            key = key_doc["_id"]
            assert "9.9.9." not in key, f"Spoofed IP found in rate_limits key: {key}"
            log(f"  ✓ Rate limit key uses real IP: {key}")
        log("✅ E2 PASS: Rate limit keys use real egress IP, not spoofed values")
        
        log("✅ SCENARIO E: ALL PASS")
        return True
        
    finally:
        # Clean up rate_limits
        cleanup_rate_limits(db, ["^admin-login:ip:"])

def scenario_f_smoke(db):
    """F. Smoke tests"""
    log("\n=== SCENARIO F: Smoke Tests ===")
    
    # F1: GET /api/catalog -> 200
    log("F1: GET /api/catalog")
    resp = requests.get(f"{INTERNAL_URL}/catalog")
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
    data = resp.json()
    assert "products" in data or isinstance(data, list), "Invalid catalog response"
    log("✅ F1 PASS: GET /api/catalog returns 200")
    
    # F2: GET /api/store-config -> paymentsEnabled false
    log("F2: GET /api/store-config")
    resp = requests.get(f"{INTERNAL_URL}/store-config")
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
    data = resp.json()
    assert data.get("paymentsEnabled") == False, f"Expected paymentsEnabled:false, got {data.get('paymentsEnabled')}"
    log("✅ F2 PASS: GET /api/store-config returns paymentsEnabled:false")
    
    # F3: POST /api/orders -> 503 PAYMENTS_UNAVAILABLE
    log("F3: POST /api/orders -> 503 PAYMENTS_UNAVAILABLE")
    resp = requests.post(f"{INTERNAL_URL}/orders", json={
        "items": [{"sku": "ARK-KV-001", "qty": 1}],
        "customer": {
            "fullName": "Test Customer",
            "email": "test@example.com",
            "mobile": "+919800000000",
            "address1": "123 Test St",
            "city": "Mumbai",
            "state": "Maharashtra",
            "pincode": "400001"
        }
    })
    assert resp.status_code == 503, f"Expected 503, got {resp.status_code}"
    data = resp.json()
    assert data.get("code") == "PAYMENTS_UNAVAILABLE", f"Expected PAYMENTS_UNAVAILABLE, got {data.get('code')}"
    log("✅ F3 PASS: POST /api/orders returns 503 PAYMENTS_UNAVAILABLE")
    
    log("✅ SCENARIO F: ALL PASS")
    return True

def main():
    log("=== ARKADHATRI Security Regression Test ===")
    log(f"Internal URL: {INTERNAL_URL}")
    log(f"External URL: {EXTERNAL_URL}")
    log(f"MongoDB: {MONGO_URL}/{DB_NAME}")
    
    # Connect to MongoDB
    client = MongoClient(MONGO_URL)
    db = client[DB_NAME]
    log("✅ Connected to MongoDB")
    
    results = {}
    
    try:
        # Run all scenarios
        results["A"] = scenario_a_unauthorized_order_access(db)
        results["B"] = scenario_b_otp(db)
        results["C"] = scenario_c_admin_reset(db)
        results["D"] = scenario_d_rate_limits(db)
        results["E"] = scenario_e_trusted_proxy(db)
        results["F"] = scenario_f_smoke(db)
        
    except Exception as e:
        log(f"❌ TEST FAILED: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    
    finally:
        # Final cleanup
        log("\n=== Final Cleanup ===")
        db.mock_outbox.delete_many({"to": {"$in": [TEST_EMAIL, ADMIN_EMAIL]}})
        db.order_otps.delete_many({})
        cleanup_rate_limits(db, [
            "^admin-login:ip:",
            "^admin-forgot:ip:",
            "^admin-reset:ip:",
            "^otp-send:",
            "^otp-verify:"
        ])
        log("✅ Final cleanup complete")
    
    # Summary
    log("\n=== SUMMARY ===")
    for scenario, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        log(f"Scenario {scenario}: {status}")
    
    all_passed = all(results.values())
    if all_passed:
        log("\n✅ ALL SCENARIOS PASSED")
        sys.exit(0)
    else:
        log("\n❌ SOME SCENARIOS FAILED")
        sys.exit(1)

if __name__ == "__main__":
    main()
