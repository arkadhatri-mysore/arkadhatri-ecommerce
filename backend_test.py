#!/usr/bin/env python3
"""
ARKADHATRI Backend Test - Focused Launch Hardening
Tests admin security, product save, media upload, coupons, orders, catalog
"""
import requests
import json
import time
import os
from typing import Dict, Any, Optional

# Configuration from .env
BASE_URL = "https://timeless-crafted-8.preview.emergentagent.com/api"
ADMIN_EMAIL = "admin@arkadhatri.com"
ADMIN_PASSWORD = "ArkAdmin@2025"

# Test state
session = requests.Session()
admin_cookie = None
test_resources = {
    'products': [],
    'coupons': [],
    'orders': [],
    'media': []
}

def log(emoji: str, msg: str):
    print(f"{emoji} {msg}")

def test_result(name: str, passed: bool, detail: str = ""):
    status = "✅ PASS" if passed else "❌ FAIL"
    msg = f"{status} | {name}"
    if detail:
        msg += f": {detail}"
    print(msg)
    return passed

# ==================== 1. ADMIN SECURITY ====================

def test_admin_security():
    """Test admin auth: no cookie, forged cookie, rate limit"""
    log("🔒", "Testing admin security...")
    
    results = []
    
    # Test 1.1: All admin routes without cookie return 401
    admin_routes = [
        ('GET', '/admin/products'),
        ('POST', '/admin/products'),
        ('GET', '/admin/orders'),
        ('GET', '/admin/coupons'),
        ('GET', '/admin/customers'),
        ('GET', '/admin/settings'),
        ('GET', '/admin/dashboard'),
        ('GET', '/admin/inventory'),
        ('GET', '/admin/me'),
        ('POST', '/admin/uploads'),
        ('PATCH', '/admin/products/dummy-id/stock'),
        ('PUT', '/admin/orders/dummy-id'),
        ('DELETE', '/admin/products/dummy-id')
    ]
    
    no_auth_pass = True
    for method, route in admin_routes:
        try:
            resp = session.request(method, f"{BASE_URL}{route}", json={})
            if resp.status_code != 401:
                log("❌", f"{method} {route} without cookie returned {resp.status_code}, expected 401")
                no_auth_pass = False
                break
        except Exception as e:
            log("❌", f"Error testing {method} {route}: {e}")
            no_auth_pass = False
            break
    
    results.append(test_result("Admin routes without cookie return 401", no_auth_pass))
    
    # Test 1.2: Forged cookie returns 401
    forged_cookie = "ark_admin=eyJyb2xlIjoiYWRtaW4ifQ.abc"
    try:
        resp = session.get(f"{BASE_URL}/admin/products", headers={"Cookie": forged_cookie})
        forged_pass = resp.status_code == 401
        results.append(test_result("Forged cookie returns 401", forged_pass))
    except Exception as e:
        results.append(test_result("Forged cookie returns 401", False, str(e)))
    
    # Test 1.3: Empty body login returns 401
    try:
        resp = session.post(f"{BASE_URL}/admin/login", json={})
        empty_pass = resp.status_code == 401
        results.append(test_result("Empty body login returns 401", empty_pass))
    except Exception as e:
        results.append(test_result("Empty body login returns 401", False, str(e)))
    
    # Test 1.4: Wrong password returns 401
    try:
        resp = session.post(f"{BASE_URL}/admin/login", json={
            "email": ADMIN_EMAIL,
            "password": "WrongPassword123"
        })
        wrong_pass = resp.status_code == 401
        results.append(test_result("Wrong password returns 401", wrong_pass))
    except Exception as e:
        results.append(test_result("Wrong password returns 401", False, str(e)))
    
    # Test 1.5: Rate limit (8 attempts per 15 min) - use unique X-Forwarded-For
    # We'll test with 3 attempts to avoid locking ourselves out
    rate_limit_pass = True
    try:
        for i in range(3):
            resp = session.post(f"{BASE_URL}/admin/login", 
                              json={"email": ADMIN_EMAIL, "password": "wrong"},
                              headers={"X-Forwarded-For": f"192.168.100.{i}"})
            if resp.status_code != 401:
                rate_limit_pass = False
                break
        results.append(test_result("Rate limit allows multiple IPs", rate_limit_pass))
    except Exception as e:
        results.append(test_result("Rate limit allows multiple IPs", False, str(e)))
    
    return all(results)

def admin_login():
    """Login as admin and store cookie"""
    global admin_cookie
    try:
        resp = session.post(f"{BASE_URL}/admin/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if resp.status_code == 200:
            # Extract cookie from Set-Cookie header
            set_cookie = resp.headers.get('Set-Cookie', '')
            if 'ark_admin=' in set_cookie:
                admin_cookie = set_cookie.split('ark_admin=')[1].split(';')[0]
                log("✓", "Admin login successful")
                return True
        log("✗", f"Admin login failed: {resp.status_code}")
        return False
    except Exception as e:
        log("✗", f"Admin login error: {e}")
        return False

# ==================== 2. PRODUCT SAVE & CATALOG ====================

def test_product_save():
    """Test product validation, duplicate detection, catalog sync"""
    log("📦", "Testing product save & catalog...")
    
    results = []
    headers = {"Cookie": f"ark_admin={admin_cookie}"}
    
    # Test 2.1: POST product requires name, sku, price>0
    try:
        resp = session.post(f"{BASE_URL}/admin/products", headers=headers, json={
            "name": "",  # Missing name
            "sku": "TEST-BE-001",
            "price": 100
        })
        missing_name = resp.status_code == 400
        results.append(test_result("POST product requires name", missing_name))
    except Exception as e:
        results.append(test_result("POST product requires name", False, str(e)))
    
    try:
        resp = session.post(f"{BASE_URL}/admin/products", headers=headers, json={
            "name": "Test Product",
            "sku": "",  # Missing SKU
            "price": 100
        })
        missing_sku = resp.status_code == 400
        results.append(test_result("POST product requires SKU", missing_sku))
    except Exception as e:
        results.append(test_result("POST product requires SKU", False, str(e)))
    
    try:
        resp = session.post(f"{BASE_URL}/admin/products", headers=headers, json={
            "name": "Test Product",
            "sku": "TEST-BE-001",
            "price": 0  # Invalid price
        })
        invalid_price = resp.status_code == 400
        results.append(test_result("POST product requires price>0", invalid_price))
    except Exception as e:
        results.append(test_result("POST product requires price>0", False, str(e)))
    
    # Test 2.2: Duplicate SKU returns 409 (use existing real SKU)
    try:
        resp = session.post(f"{BASE_URL}/admin/products", headers=headers, json={
            "name": "Duplicate Test",
            "sku": "ARK-KV-001",  # Existing real SKU
            "slug": "duplicate-test",
            "price": 100
        })
        dup_sku = resp.status_code == 409
        results.append(test_result("Duplicate SKU returns 409", dup_sku))
    except Exception as e:
        results.append(test_result("Duplicate SKU returns 409", False, str(e)))
    
    # Test 2.3: Duplicate slug returns 409 (use existing real slug)
    try:
        resp = session.post(f"{BASE_URL}/admin/products", headers=headers, json={
            "name": "Duplicate Slug Test",
            "sku": "TEST-BE-DUP-001",
            "slug": "kavya",  # Existing real slug
            "price": 100
        })
        dup_slug = resp.status_code == 409
        results.append(test_result("Duplicate slug returns 409", dup_slug))
    except Exception as e:
        results.append(test_result("Duplicate slug returns 409", False, str(e)))
    
    # Test 2.4: Create TEST product successfully
    test_product = None
    try:
        resp = session.post(f"{BASE_URL}/admin/products", headers=headers, json={
            "name": "Test Banarasi Saree",
            "sku": "TEST-BE-001",
            "slug": "test-be-banarasi-001",
            "price": 8500,
            "comparePrice": 12000,
            "stock": 3,
            "status": "published",
            "description": "Beautiful test saree for backend validation",
            "fabricType": "Pure Silk",
            "colourName": "Royal Blue",
            "colourFamily": "Blue",
            "images": [],
            "videoUrl": ""
        })
        if resp.status_code == 200:
            test_product = resp.json().get('product', {})
            test_resources['products'].append(test_product['id'])
            results.append(test_result("Create TEST product", True, f"ID: {test_product['id']}"))
        else:
            results.append(test_result("Create TEST product", False, f"Status: {resp.status_code}"))
    except Exception as e:
        results.append(test_result("Create TEST product", False, str(e)))
    
    if not test_product:
        return all(results)
    
    # Test 2.5: PUT update price/stock/description
    try:
        resp = session.put(f"{BASE_URL}/admin/products/{test_product['id']}", 
                          headers=headers, json={
            "name": test_product['name'],
            "sku": test_product['sku'],
            "slug": test_product['slug'],
            "price": 9000,  # Updated price
            "stock": 5,  # Updated stock
            "description": "Updated description for testing",
            "status": "published"
        })
        update_pass = resp.status_code == 200
        results.append(test_result("PUT update product", update_pass))
    except Exception as e:
        results.append(test_result("PUT update product", False, str(e)))
    
    # Test 2.6: GET /api/catalog/:slug reflects changes immediately
    time.sleep(0.5)
    try:
        resp = session.get(f"{BASE_URL}/catalog/{test_product['slug']}")
        if resp.status_code == 200:
            catalog_product = resp.json().get('product', {})
            price_match = catalog_product.get('price') == 9000
            stock_match = catalog_product.get('stock') == 5
            desc_match = "Updated description" in catalog_product.get('description', '')
            in_stock = catalog_product.get('inStock') == True
            
            catalog_sync = price_match and stock_match and desc_match and in_stock
            results.append(test_result("Catalog reflects updates immediately", catalog_sync,
                                     f"price={catalog_product.get('price')}, stock={catalog_product.get('stock')}, inStock={in_stock}"))
        else:
            results.append(test_result("Catalog reflects updates immediately", False, f"Status: {resp.status_code}"))
    except Exception as e:
        results.append(test_result("Catalog reflects updates immediately", False, str(e)))
    
    # Test 2.7: PUT unknown id returns 404
    try:
        resp = session.put(f"{BASE_URL}/admin/products/unknown-id-12345", 
                          headers=headers, json={
            "name": "Test",
            "sku": "TEST",
            "price": 100
        })
        unknown_id = resp.status_code == 404
        results.append(test_result("PUT unknown id returns 404", unknown_id))
    except Exception as e:
        results.append(test_result("PUT unknown id returns 404", False, str(e)))
    
    # Test 2.8: Status draft -> not in /api/catalog
    try:
        # Create draft product
        resp = session.post(f"{BASE_URL}/admin/products", headers=headers, json={
            "name": "Draft Test Product",
            "sku": "TEST-BE-DRAFT-001",
            "slug": "test-be-draft-001",
            "price": 5000,
            "stock": 10,
            "status": "draft"
        })
        if resp.status_code == 200:
            draft_product = resp.json().get('product', {})
            test_resources['products'].append(draft_product['id'])
            
            # Check it's NOT in catalog
            time.sleep(0.5)
            resp2 = session.get(f"{BASE_URL}/catalog/{draft_product['slug']}")
            draft_hidden = resp2.status_code == 404
            results.append(test_result("Draft product not in catalog", draft_hidden))
        else:
            results.append(test_result("Draft product not in catalog", False, "Failed to create draft"))
    except Exception as e:
        results.append(test_result("Draft product not in catalog", False, str(e)))
    
    # Test 2.9: PATCH /api/admin/products/:id/stock works and syncs
    try:
        resp = session.patch(f"{BASE_URL}/admin/products/{test_product['id']}/stock",
                           headers=headers, json={"stock": 0})
        if resp.status_code == 200:
            time.sleep(0.5)
            resp2 = session.get(f"{BASE_URL}/catalog/{test_product['slug']}")
            if resp2.status_code == 200:
                catalog_product = resp2.json().get('product', {})
                stock_zero = catalog_product.get('stock') == 0
                in_stock_false = catalog_product.get('inStock') == False
                stock_sync = stock_zero and in_stock_false
                results.append(test_result("PATCH stock syncs to catalog (inStock=false when 0)", stock_sync,
                                         f"stock={catalog_product.get('stock')}, inStock={catalog_product.get('inStock')}"))
            else:
                results.append(test_result("PATCH stock syncs to catalog", False, "Catalog fetch failed"))
        else:
            results.append(test_result("PATCH stock syncs to catalog", False, f"Status: {resp.status_code}"))
    except Exception as e:
        results.append(test_result("PATCH stock syncs to catalog", False, str(e)))
    
    return all(results)

# ==================== 3. MEDIA UPLOAD ====================

def test_media_upload():
    """Test chunked media upload with ~2MB video"""
    log("🎬", "Testing media upload...")
    
    results = []
    headers = {"Cookie": f"ark_admin={admin_cookie}"}
    
    # Create ~2MB random video data
    video_size = 2 * 1024 * 1024  # 2MB
    video_data = os.urandom(video_size)
    
    # Test 3.1: POST /api/admin/uploads init
    upload_id = None
    chunk_size = None
    total_chunks = None
    try:
        resp = session.post(f"{BASE_URL}/admin/uploads", headers=headers, json={
            "filename": "test-video.mp4",
            "mime": "video/mp4",
            "size": video_size
        })
        if resp.status_code == 200:
            data = resp.json()
            upload_id = data.get('uploadId')
            chunk_size = data.get('chunkSize')
            total_chunks = data.get('totalChunks')
            results.append(test_result("Init upload", True, 
                                     f"uploadId={upload_id[:8]}..., chunks={total_chunks}"))
        else:
            results.append(test_result("Init upload", False, f"Status: {resp.status_code}"))
    except Exception as e:
        results.append(test_result("Init upload", False, str(e)))
    
    if not upload_id:
        return all(results)
    
    # Test 3.2: PUT chunks
    chunks_uploaded = 0
    try:
        for i in range(total_chunks):
            start = i * chunk_size
            end = min(start + chunk_size, video_size)
            chunk_data = video_data[start:end]
            
            resp = session.put(f"{BASE_URL}/admin/uploads/{upload_id}/chunks/{i}",
                             headers={**headers, "Content-Type": "application/octet-stream"},
                             data=chunk_data)
            if resp.status_code == 200:
                chunks_uploaded += 1
            else:
                break
        
        chunks_pass = chunks_uploaded == total_chunks
        results.append(test_result("Upload chunks", chunks_pass, 
                                  f"{chunks_uploaded}/{total_chunks} chunks"))
    except Exception as e:
        results.append(test_result("Upload chunks", False, str(e)))
    
    # Test 3.3: POST complete
    media_url = None
    try:
        resp = session.post(f"{BASE_URL}/admin/uploads/{upload_id}/complete", headers=headers)
        if resp.status_code == 200:
            data = resp.json()
            media_url = data.get('url')
            test_resources['media'].append(media_url)
            results.append(test_result("Complete upload", True, f"url={media_url}"))
        else:
            results.append(test_result("Complete upload", False, f"Status: {resp.status_code}, {resp.text}"))
    except Exception as e:
        results.append(test_result("Complete upload", False, str(e)))
    
    if not media_url:
        return all(results)
    
    # Test 3.4: GET url returns identical bytes
    try:
        resp = session.get(f"{BASE_URL.replace('/api', '')}{media_url}")
        if resp.status_code == 200:
            downloaded_data = resp.content
            bytes_match = len(downloaded_data) == video_size
            results.append(test_result("GET media returns correct size", bytes_match,
                                     f"{len(downloaded_data)} bytes"))
        else:
            results.append(test_result("GET media returns correct size", False, f"Status: {resp.status_code}"))
    except Exception as e:
        results.append(test_result("GET media returns correct size", False, str(e)))
    
    # Test 3.5: Range request (bytes=100-199) returns 206
    try:
        resp = session.get(f"{BASE_URL.replace('/api', '')}{media_url}",
                          headers={"Range": "bytes=100-199"})
        range_pass = resp.status_code == 206 and 'Content-Range' in resp.headers
        results.append(test_result("Range request returns 206", range_pass,
                                  f"Content-Range: {resp.headers.get('Content-Range', 'N/A')}"))
    except Exception as e:
        results.append(test_result("Range request returns 206", False, str(e)))
    
    # Test 3.6: Bad range returns 416
    try:
        resp = session.get(f"{BASE_URL.replace('/api', '')}{media_url}",
                          headers={"Range": f"bytes={video_size + 1000}-{video_size + 2000}"})
        bad_range = resp.status_code == 416
        results.append(test_result("Bad range returns 416", bad_range))
    except Exception as e:
        results.append(test_result("Bad range returns 416", False, str(e)))
    
    # Test 3.7: Unknown media returns 404
    try:
        resp = session.get(f"{BASE_URL}/media/unknown-file-12345.mp4")
        unknown_media = resp.status_code == 404
        results.append(test_result("Unknown media returns 404", unknown_media))
    except Exception as e:
        results.append(test_result("Unknown media returns 404", False, str(e)))
    
    # Test 3.8: Wrong mime returns 415
    try:
        resp = session.post(f"{BASE_URL}/admin/uploads", headers=headers, json={
            "filename": "test.exe",
            "mime": "application/x-msdownload",
            "size": 1000
        })
        wrong_mime = resp.status_code == 415
        results.append(test_result("Wrong mime returns 415", wrong_mime))
    except Exception as e:
        results.append(test_result("Wrong mime returns 415", False, str(e)))
    
    # Test 3.9: Oversize returns 413
    try:
        resp = session.post(f"{BASE_URL}/admin/uploads", headers=headers, json={
            "filename": "huge.mp4",
            "mime": "video/mp4",
            "size": 300 * 1024 * 1024  # 300MB (over 200MB limit)
        })
        oversize = resp.status_code == 413
        results.append(test_result("Oversize returns 413", oversize))
    except Exception as e:
        results.append(test_result("Oversize returns 413", False, str(e)))
    
    # Test 3.10: Complete with missing chunk returns 400
    try:
        # Init new upload
        resp = session.post(f"{BASE_URL}/admin/uploads", headers=headers, json={
            "filename": "incomplete.mp4",
            "mime": "video/mp4",
            "size": 1024 * 1024
        })
        if resp.status_code == 200:
            incomplete_id = resp.json().get('uploadId')
            # Try to complete without uploading chunks
            resp2 = session.post(f"{BASE_URL}/admin/uploads/{incomplete_id}/complete", headers=headers)
            incomplete_pass = resp2.status_code == 400
            results.append(test_result("Complete with missing chunk returns 400", incomplete_pass))
        else:
            results.append(test_result("Complete with missing chunk returns 400", False, "Init failed"))
    except Exception as e:
        results.append(test_result("Complete with missing chunk returns 400", False, str(e)))
    
    return all(results)

# ==================== 4. COUPONS + ORDERS ====================

def test_coupons_orders():
    """Test coupon creation, validation, order with discount"""
    log("🎟️", "Testing coupons + orders...")
    
    results = []
    headers = {"Cookie": f"ark_admin={admin_cookie}"}
    
    # Test 4.1: Create TEST coupon
    coupon_id = None
    try:
        resp = session.post(f"{BASE_URL}/admin/coupons", headers=headers, json={
            "code": "TESTBE10",
            "type": "percentage",
            "value": 10,
            "minPurchase": 5000,
            "active": True,
            "usageLimit": 100
        })
        if resp.status_code == 200:
            coupon = resp.json().get('coupon', {})
            coupon_id = coupon.get('id')
            test_resources['coupons'].append(coupon_id)
            results.append(test_result("Create TEST coupon", True, f"code=TESTBE10, id={coupon_id}"))
        else:
            results.append(test_result("Create TEST coupon", False, f"Status: {resp.status_code}"))
    except Exception as e:
        results.append(test_result("Create TEST coupon", False, str(e)))
    
    # Test 4.2: Validate coupon (public endpoint)
    try:
        resp = session.post(f"{BASE_URL}/coupons/validate", json={
            "code": "TESTBE10",
            "subtotal": 10000
        })
        if resp.status_code == 200:
            data = resp.json()
            discount = data.get('discount', 0)
            expected_discount = 1000  # 10% of 10000
            discount_match = discount == expected_discount
            results.append(test_result("Validate coupon (percentage)", discount_match,
                                     f"discount={discount}, expected={expected_discount}"))
        else:
            results.append(test_result("Validate coupon (percentage)", False, f"Status: {resp.status_code}"))
    except Exception as e:
        results.append(test_result("Validate coupon (percentage)", False, str(e)))
    
    # Test 4.3: Validate with minPurchase not met
    try:
        resp = session.post(f"{BASE_URL}/coupons/validate", json={
            "code": "TESTBE10",
            "subtotal": 3000  # Below minPurchase of 5000
        })
        min_purchase_fail = resp.status_code == 400
        results.append(test_result("Coupon minPurchase validation", min_purchase_fail))
    except Exception as e:
        results.append(test_result("Coupon minPurchase validation", False, str(e)))
    
    # Test 4.4: Create flat discount coupon
    flat_coupon_id = None
    try:
        resp = session.post(f"{BASE_URL}/admin/coupons", headers=headers, json={
            "code": "TESTFLAT500",
            "type": "flat",
            "value": 500,
            "minPurchase": 2000,
            "active": True
        })
        if resp.status_code == 200:
            flat_coupon = resp.json().get('coupon', {})
            flat_coupon_id = flat_coupon.get('id')
            test_resources['coupons'].append(flat_coupon_id)
            
            # Validate flat coupon
            resp2 = session.post(f"{BASE_URL}/coupons/validate", json={
                "code": "TESTFLAT500",
                "subtotal": 5000
            })
            if resp2.status_code == 200:
                discount = resp2.json().get('discount', 0)
                flat_pass = discount == 500
                results.append(test_result("Validate coupon (flat)", flat_pass, f"discount={discount}"))
            else:
                results.append(test_result("Validate coupon (flat)", False, "Validation failed"))
        else:
            results.append(test_result("Validate coupon (flat)", False, "Creation failed"))
    except Exception as e:
        results.append(test_result("Validate coupon (flat)", False, str(e)))
    
    # Test 4.5: Expired coupon
    try:
        resp = session.post(f"{BASE_URL}/admin/coupons", headers=headers, json={
            "code": "TESTEXPIRED",
            "type": "percentage",
            "value": 20,
            "expiryDate": "2020-01-01T00:00:00Z",  # Past date
            "active": True
        })
        if resp.status_code == 200:
            expired_coupon = resp.json().get('coupon', {})
            test_resources['coupons'].append(expired_coupon.get('id'))
            
            # Try to validate
            resp2 = session.post(f"{BASE_URL}/coupons/validate", json={
                "code": "TESTEXPIRED",
                "subtotal": 5000
            })
            expired_fail = resp2.status_code in [400, 404]
            results.append(test_result("Expired coupon rejected", expired_fail))
        else:
            results.append(test_result("Expired coupon rejected", False, "Creation failed"))
    except Exception as e:
        results.append(test_result("Expired coupon rejected", False, str(e)))
    
    # Test 4.6: Inactive coupon
    try:
        resp = session.post(f"{BASE_URL}/admin/coupons", headers=headers, json={
            "code": "TESTINACTIVE",
            "type": "percentage",
            "value": 15,
            "active": False
        })
        if resp.status_code == 200:
            inactive_coupon = resp.json().get('coupon', {})
            test_resources['coupons'].append(inactive_coupon.get('id'))
            
            # Try to validate
            resp2 = session.post(f"{BASE_URL}/coupons/validate", json={
                "code": "TESTINACTIVE",
                "subtotal": 5000
            })
            inactive_fail = resp2.status_code in [400, 404]
            results.append(test_result("Inactive coupon rejected", inactive_fail))
        else:
            results.append(test_result("Inactive coupon rejected", False, "Creation failed"))
    except Exception as e:
        results.append(test_result("Inactive coupon rejected", False, str(e)))
    
    # Test 4.7: Create order with coupon and verify discount math
    # First, get a test product
    test_product = None
    try:
        resp = session.get(f"{BASE_URL}/admin/products", headers=headers)
        if resp.status_code == 200:
            products = resp.json().get('products', [])
            # Find TEST-BE-001 or any published product
            for p in products:
                if p.get('sku') == 'TEST-BE-001' and p.get('status') == 'published':
                    test_product = p
                    break
            if not test_product:
                for p in products:
                    if p.get('status') == 'published' and p.get('stock', 0) > 0:
                        test_product = p
                        break
    except Exception as e:
        pass
    
    if test_product:
        # Ensure stock is available
        try:
            session.patch(f"{BASE_URL}/admin/products/{test_product['id']}/stock",
                        headers=headers, json={"stock": 10, "status": "published"})
            time.sleep(0.5)
        except:
            pass
        
        # Calculate qty to meet minPurchase
        price = test_product.get('price', 0)
        qty = max(1, int(5000 / price) + 1) if price > 0 else 1
        
        try:
            resp = session.post(f"{BASE_URL}/orders", json={
                "items": [{"sku": test_product['sku'], "qty": qty}],
                "customer": {
                    "fullName": "Ananya Reddy",
                    "email": "ananya.reddy@example.com",
                    "mobile": "9876543210",
                    "address1": "45 Jubilee Hills",
                    "address2": "Road No 36",
                    "city": "Hyderabad",
                    "state": "Telangana",
                    "pincode": "500033"
                },
                "couponCode": "TESTBE10"
            })
            if resp.status_code == 200:
                data = resp.json()
                order = data.get('order', {})
                test_resources['orders'].append(order.get('id'))
                
                # Verify discount math
                subtotal = order.get('subtotal', 0)
                discount = order.get('discount', 0)
                expected_discount = int(subtotal * 0.1)
                
                # Allow 1 rupee rounding difference
                discount_correct = abs(discount - expected_discount) <= 1
                
                # Verify stock reservation
                stock_reserved = order.get('stockReserved') == True
                stock_committed = order.get('stockCommitted') == False
                
                # Verify coupon applied
                coupon_applied = order.get('couponApplied', {}).get('code') == 'TESTBE10'
                
                order_pass = discount_correct and stock_reserved and not stock_committed and coupon_applied
                
                # Detailed error reporting
                if not order_pass:
                    details = f"subtotal={subtotal}, discount={discount}, stockReserved={stock_reserved}, stockCommitted={stock_committed}, couponApplied={order.get('couponApplied', {}).get('code')}"
                else:
                    details = f"subtotal={subtotal}, discount={discount}, stockReserved={stock_reserved}"
                
                results.append(test_result("Order with coupon (server-side discount)", order_pass, details))
            else:
                results.append(test_result("Order with coupon", False, f"Status: {resp.status_code}, {resp.text}"))
        except Exception as e:
            results.append(test_result("Order with coupon", False, str(e)))
    else:
        results.append(test_result("Order with coupon", False, "No test product available"))
    
    return all(results)

# ==================== 5. PUBLIC ENDPOINTS ====================

def test_public_endpoints():
    """Test public health and catalog endpoints"""
    log("🌐", "Testing public endpoints...")
    
    results = []
    
    # Test 5.1: GET /api/health
    try:
        resp = session.get(f"{BASE_URL}/health")
        if resp.status_code == 200:
            data = resp.json()
            has_ok = data.get('ok') == True
            has_service = 'service' in data
            has_db = 'db' in data
            health_pass = has_ok and has_service and has_db
            results.append(test_result("GET /api/health", health_pass, 
                                     f"ok={data.get('ok')}, db={data.get('db')}"))
        else:
            results.append(test_result("GET /api/health", False, f"Status: {resp.status_code}"))
    except Exception as e:
        results.append(test_result("GET /api/health", False, str(e)))
    
    # Test 5.2: GET /api/catalog
    try:
        resp = session.get(f"{BASE_URL}/catalog")
        if resp.status_code == 200:
            data = resp.json()
            products = data.get('products', [])
            has_products = len(products) > 0
            
            # Verify product structure
            if has_products:
                p = products[0]
                has_required = all(k in p for k in ['name', 'sku', 'slug', 'price', 'stock', 'inStock'])
                no_internal = '_id' not in p and 'metaKeywords' not in p
                catalog_pass = has_required and no_internal
                results.append(test_result("GET /api/catalog", catalog_pass,
                                         f"{len(products)} products, no internal fields"))
            else:
                results.append(test_result("GET /api/catalog", False, "No products returned"))
        else:
            results.append(test_result("GET /api/catalog", False, f"Status: {resp.status_code}"))
    except Exception as e:
        results.append(test_result("GET /api/catalog", False, str(e)))
    
    # Test 5.3: GET /api/catalog/:slug (use TEST product if available)
    try:
        # Try to get TEST-BE-001 product
        resp = session.get(f"{BASE_URL}/catalog/test-be-banarasi-001")
        if resp.status_code == 200:
            data = resp.json()
            product = data.get('product', {})
            has_product = 'name' in product and 'sku' in product
            results.append(test_result("GET /api/catalog/:slug", has_product,
                                     f"slug=test-be-banarasi-001"))
        else:
            # Try with any product from catalog
            resp2 = session.get(f"{BASE_URL}/catalog")
            if resp2.status_code == 200:
                products = resp2.json().get('products', [])
                if products:
                    slug = products[0].get('slug')
                    resp3 = session.get(f"{BASE_URL}/catalog/{slug}")
                    slug_pass = resp3.status_code == 200
                    results.append(test_result("GET /api/catalog/:slug", slug_pass, f"slug={slug}"))
                else:
                    results.append(test_result("GET /api/catalog/:slug", False, "No products"))
            else:
                results.append(test_result("GET /api/catalog/:slug", False, "Catalog fetch failed"))
    except Exception as e:
        results.append(test_result("GET /api/catalog/:slug", False, str(e)))
    
    return all(results)

# ==================== CLEANUP ====================

def cleanup():
    """Delete all TEST resources"""
    log("🧹", "Cleaning up TEST resources...")
    
    headers = {"Cookie": f"ark_admin={admin_cookie}"}
    
    # Delete TEST products
    for product_id in test_resources['products']:
        try:
            resp = session.delete(f"{BASE_URL}/admin/products/{product_id}", headers=headers)
            if resp.status_code == 200:
                log("✓", f"Deleted product {product_id}")
            else:
                log("✗", f"Failed to delete product {product_id}: {resp.status_code}")
        except Exception as e:
            log("✗", f"Error deleting product {product_id}: {e}")
    
    # Delete TEST coupons
    for coupon_id in test_resources['coupons']:
        try:
            resp = session.delete(f"{BASE_URL}/admin/coupons/{coupon_id}", headers=headers)
            if resp.status_code == 200:
                log("✓", f"Deleted coupon {coupon_id}")
            else:
                log("✗", f"Failed to delete coupon {coupon_id}: {resp.status_code}")
        except Exception as e:
            log("✗", f"Error deleting coupon {coupon_id}: {e}")
    
    # Note: Orders are kept for audit trail (as per requirements)
    log("ℹ️", f"Created {len(test_resources['orders'])} test orders (kept for audit)")
    
    # Clean up existing TEST products (TEST-UP-001, TEST-UI-002)
    try:
        resp = session.get(f"{BASE_URL}/admin/products", headers=headers)
        if resp.status_code == 200:
            products = resp.json().get('products', [])
            for p in products:
                sku = p.get('sku', '')
                if sku in ['TEST-UP-001', 'TEST-UI-002']:
                    resp2 = session.delete(f"{BASE_URL}/admin/products/{p['id']}", headers=headers)
                    if resp2.status_code == 200:
                        log("✓", f"Deleted existing test product {sku}")
    except Exception as e:
        log("✗", f"Error cleaning existing test products: {e}")

# ==================== MAIN ====================

def main():
    print("=" * 70)
    print("ARKADHATRI BACKEND TEST - FOCUSED LAUNCH HARDENING")
    print("=" * 70)
    print(f"Base URL: {BASE_URL}")
    print(f"Admin: {ADMIN_EMAIL}")
    print("=" * 70)
    print()
    
    all_results = []
    
    # 1. Admin Security (before login)
    all_results.append(test_admin_security())
    print()
    
    # Login once and reuse session
    if not admin_login():
        log("❌", "FATAL: Admin login failed")
        return False
    print()
    
    # 2. Product Save & Catalog
    all_results.append(test_product_save())
    print()
    
    # 3. Media Upload
    all_results.append(test_media_upload())
    print()
    
    # 4. Coupons + Orders
    all_results.append(test_coupons_orders())
    print()
    
    # 5. Public Endpoints
    all_results.append(test_public_endpoints())
    print()
    
    # Cleanup
    cleanup()
    print()
    
    # Summary
    print("=" * 70)
    print("TEST SUMMARY")
    print("=" * 70)
    passed = sum(1 for r in all_results if r)
    total = len(all_results)
    print(f"Sections passed: {passed}/{total}")
    print("=" * 70)
    
    return all(all_results)

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
