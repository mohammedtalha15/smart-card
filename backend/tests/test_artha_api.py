"""
Artha API Backend Tests
Tests for: Auth, Vendors, Offers, QR System, Transactions, Admin, Domains
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "admin@artha.com"
ADMIN_PASSWORD = "admin123"
VENDOR_EMAIL = "thebrewroom@vendor.artha.com"
VENDOR_PASSWORD = "vendor123"


class TestHealthCheck:
    """Health check endpoint tests"""
    
    def test_health_endpoint(self):
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["app"] == "Artha"
        print("✓ Health check passed")


class TestAdminAuth:
    """Admin authentication tests"""
    
    def test_admin_login_success(self):
        response = requests.post(f"{BASE_URL}/api/auth/admin/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "user" in data
        assert data["role"] == "admin"
        assert data["user"]["email"] == ADMIN_EMAIL
        print(f"✓ Admin login successful, token received")
        return data["token"]
    
    def test_admin_login_invalid_credentials(self):
        response = requests.post(f"{BASE_URL}/api/auth/admin/login", json={
            "email": "wrong@admin.com",
            "password": "wrongpass"
        })
        assert response.status_code == 401
        print("✓ Admin login with invalid credentials rejected")


class TestVendorAuth:
    """Vendor authentication tests"""
    
    def test_vendor_login_success(self):
        response = requests.post(f"{BASE_URL}/api/auth/vendor/login", json={
            "email": VENDOR_EMAIL,
            "password": VENDOR_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "vendor" in data
        assert data["role"] == "vendor"
        assert data["vendor"]["name"] == "The Brew Room"
        print(f"✓ Vendor login successful")
        return data["token"], data["vendor"]["vendor_id"]
    
    def test_vendor_login_invalid_credentials(self):
        response = requests.post(f"{BASE_URL}/api/auth/vendor/login", json={
            "email": "wrong@vendor.artha.com",
            "password": "wrongpass"
        })
        assert response.status_code == 401
        print("✓ Vendor login with invalid credentials rejected")


class TestAdminDashboard:
    """Admin dashboard and stats tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        # Get admin token
        response = requests.post(f"{BASE_URL}/api/auth/admin/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        self.token = response.json()["token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_admin_dashboard_stats(self):
        response = requests.get(f"{BASE_URL}/api/admin/dashboard", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert "total_vendors" in data
        assert "total_offers" in data
        assert "total_transactions" in data
        assert "total_users" in data
        assert data["total_vendors"] >= 5, f"Expected at least 5 vendors, got {data['total_vendors']}"
        assert data["total_offers"] >= 5, f"Expected at least 5 offers, got {data['total_offers']}"
        print(f"✓ Admin dashboard stats: {data['total_vendors']} vendors, {data['total_offers']} offers")
    
    def test_admin_dashboard_unauthorized(self):
        response = requests.get(f"{BASE_URL}/api/admin/dashboard")
        assert response.status_code == 401
        print("✓ Admin dashboard requires authentication")


class TestAdminVendors:
    """Admin vendor management tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        response = requests.post(f"{BASE_URL}/api/auth/admin/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        self.token = response.json()["token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_list_vendors(self):
        response = requests.get(f"{BASE_URL}/api/admin/vendors", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert "vendors" in data
        assert len(data["vendors"]) >= 5, f"Expected at least 5 vendors, got {len(data['vendors'])}"
        # Check vendor structure
        vendor = data["vendors"][0]
        assert "vendor_id" in vendor
        assert "name" in vendor
        assert "category" in vendor
        print(f"✓ Listed {len(data['vendors'])} vendors")
    
    def test_create_and_delete_vendor(self):
        # Create vendor
        create_response = requests.post(f"{BASE_URL}/api/admin/vendors", headers=self.headers, json={
            "name": "TEST_Vendor",
            "location": "Test Location",
            "category": "cafe",
            "description": "Test vendor for testing",
            "email": "testvendor@vendor.artha.com",
            "password": "test123"
        })
        assert create_response.status_code == 200
        created = create_response.json()
        assert "vendor" in created
        vendor_id = created["vendor"]["vendor_id"]
        print(f"✓ Created test vendor: {vendor_id}")
        
        # Delete vendor
        delete_response = requests.delete(f"{BASE_URL}/api/admin/vendors/{vendor_id}", headers=self.headers)
        assert delete_response.status_code == 200
        print(f"✓ Deleted test vendor: {vendor_id}")


class TestAdminOffers:
    """Admin offer management tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        response = requests.post(f"{BASE_URL}/api/auth/admin/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        self.token = response.json()["token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_list_offers(self):
        response = requests.get(f"{BASE_URL}/api/admin/offers", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert "offers" in data
        assert len(data["offers"]) >= 5, f"Expected at least 5 offers, got {len(data['offers'])}"
        # Check offer structure
        offer = data["offers"][0]
        assert "offer_id" in offer
        assert "vendor_id" in offer
        assert "discount" in offer
        print(f"✓ Listed {len(data['offers'])} offers")


class TestAdminDomains:
    """Admin domain management tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        response = requests.post(f"{BASE_URL}/api/auth/admin/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        self.token = response.json()["token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_list_domains(self):
        response = requests.get(f"{BASE_URL}/api/admin/domains", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert "domains" in data
        assert len(data["domains"]) >= 2, f"Expected at least 2 domains, got {len(data['domains'])}"
        domain_names = [d["domain"] for d in data["domains"]]
        assert "bmsit.in" in domain_names
        assert "rvce.edu.in" in domain_names
        print(f"✓ Listed {len(data['domains'])} domains: {domain_names}")
    
    def test_add_and_delete_domain(self):
        test_domain = "testcollege.edu.in"
        
        # Add domain
        add_response = requests.post(f"{BASE_URL}/api/admin/domains", headers=self.headers, json={
            "domain": test_domain
        })
        assert add_response.status_code == 200
        print(f"✓ Added domain: {test_domain}")
        
        # Verify it exists
        list_response = requests.get(f"{BASE_URL}/api/admin/domains", headers=self.headers)
        domains = [d["domain"] for d in list_response.json()["domains"]]
        assert test_domain in domains
        
        # Delete domain
        delete_response = requests.delete(f"{BASE_URL}/api/admin/domains/{test_domain}", headers=self.headers)
        assert delete_response.status_code == 200
        print(f"✓ Deleted domain: {test_domain}")
        
        # Verify it's gone
        list_response2 = requests.get(f"{BASE_URL}/api/admin/domains", headers=self.headers)
        domains2 = [d["domain"] for d in list_response2.json()["domains"]]
        assert test_domain not in domains2


class TestAdminTransactions:
    """Admin transactions tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        response = requests.post(f"{BASE_URL}/api/auth/admin/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        self.token = response.json()["token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_list_transactions(self):
        response = requests.get(f"{BASE_URL}/api/admin/transactions", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert "transactions" in data
        print(f"✓ Listed {len(data['transactions'])} transactions")


class TestVendorDashboard:
    """Vendor dashboard tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        response = requests.post(f"{BASE_URL}/api/auth/vendor/login", json={
            "email": VENDOR_EMAIL,
            "password": VENDOR_PASSWORD
        })
        data = response.json()
        self.token = data["token"]
        self.vendor_id = data["vendor"]["vendor_id"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_vendor_dashboard(self):
        response = requests.get(f"{BASE_URL}/api/vendor/dashboard", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert "vendor" in data
        assert "total_scans" in data
        assert "unique_users" in data
        assert "offers" in data
        assert data["vendor"]["name"] == "The Brew Room"
        print(f"✓ Vendor dashboard: {data['total_scans']} scans, {data['unique_users']} unique users")
    
    def test_vendor_transactions(self):
        response = requests.get(f"{BASE_URL}/api/vendor/transactions", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert "transactions" in data
        print(f"✓ Vendor transactions: {len(data['transactions'])} transactions")


class TestStudentFlow:
    """Student flow tests - requires creating test student in DB"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        # Create test student and session directly in MongoDB
        import subprocess
        timestamp = int(time.time() * 1000)
        self.user_id = f"test-user-{timestamp}"
        self.session_token = f"test_session_{timestamp}"
        
        mongo_script = f"""
        use('artha_db');
        db.users.deleteMany({{user_id: /^test-user-/}});
        db.user_sessions.deleteMany({{session_token: /^test_session_/}});
        db.users.insertOne({{
          user_id: '{self.user_id}',
          email: 'test.user.{timestamp}@bmsit.in',
          name: 'Test Student',
          picture: 'https://via.placeholder.com/150',
          role: 'student',
          verified: true,
          college: 'bmsit',
          blocked: false,
          created_at: new Date().toISOString()
        }});
        db.user_sessions.insertOne({{
          user_id: '{self.user_id}',
          session_token: '{self.session_token}',
          expires_at: new Date(Date.now() + 7*24*60*60*1000).toISOString(),
          created_at: new Date().toISOString()
        }});
        print('Created test student');
        """
        result = subprocess.run(['mongosh', '--eval', mongo_script], capture_output=True, text=True)
        self.headers = {"Authorization": f"Bearer {self.session_token}"}
    
    def test_student_auth_me(self):
        response = requests.get(f"{BASE_URL}/api/auth/me", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert data["role"] == "student"
        assert data["verified"] == True
        print(f"✓ Student auth/me: {data['name']}")
    
    def test_student_list_vendors(self):
        response = requests.get(f"{BASE_URL}/api/vendors", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert "vendors" in data
        assert len(data["vendors"]) >= 5
        print(f"✓ Student can list {len(data['vendors'])} vendors")
    
    def test_student_get_vendor_detail(self):
        # First get vendors list
        list_response = requests.get(f"{BASE_URL}/api/vendors", headers=self.headers)
        vendors = list_response.json()["vendors"]
        vendor_id = vendors[0]["vendor_id"]
        
        # Get vendor detail
        response = requests.get(f"{BASE_URL}/api/vendors/{vendor_id}", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert "vendor" in data
        assert "offers" in data
        print(f"✓ Student can view vendor detail: {data['vendor']['name']}")
    
    def test_student_search_vendors(self):
        response = requests.get(f"{BASE_URL}/api/vendors?search=Brew", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data["vendors"]) >= 1
        assert "Brew" in data["vendors"][0]["name"]
        print(f"✓ Student can search vendors")
    
    def test_student_filter_vendors_by_category(self):
        response = requests.get(f"{BASE_URL}/api/vendors?category=cafe", headers=self.headers)
        assert response.status_code == 200
        data = response.json()
        for v in data["vendors"]:
            assert v["category"] == "cafe"
        print(f"✓ Student can filter vendors by category")


class TestQRFlow:
    """QR generation and validation flow tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        # Create test student
        import subprocess
        timestamp = int(time.time() * 1000)
        self.user_id = f"test-user-qr-{timestamp}"
        self.session_token = f"test_session_qr_{timestamp}"
        
        mongo_script = f"""
        use('artha_db');
        db.users.deleteMany({{user_id: /^test-user-qr-/}});
        db.user_sessions.deleteMany({{session_token: /^test_session_qr_/}});
        db.users.insertOne({{
          user_id: '{self.user_id}',
          email: 'test.qr.{timestamp}@bmsit.in',
          name: 'QR Test Student',
          picture: '',
          role: 'student',
          verified: true,
          college: 'bmsit',
          blocked: false,
          created_at: new Date().toISOString()
        }});
        db.user_sessions.insertOne({{
          user_id: '{self.user_id}',
          session_token: '{self.session_token}',
          expires_at: new Date(Date.now() + 7*24*60*60*1000).toISOString(),
          created_at: new Date().toISOString()
        }});
        """
        subprocess.run(['mongosh', '--eval', mongo_script], capture_output=True, text=True)
        self.student_headers = {"Authorization": f"Bearer {self.session_token}"}
        
        # Get vendor token
        vendor_response = requests.post(f"{BASE_URL}/api/auth/vendor/login", json={
            "email": VENDOR_EMAIL,
            "password": VENDOR_PASSWORD
        })
        vendor_data = vendor_response.json()
        self.vendor_token = vendor_data["token"]
        self.vendor_id = vendor_data["vendor"]["vendor_id"]
        self.vendor_headers = {"Authorization": f"Bearer {self.vendor_token}"}
    
    def test_full_qr_flow(self):
        # 1. Get vendor and offer
        vendor_response = requests.get(f"{BASE_URL}/api/vendors/{self.vendor_id}", headers=self.student_headers)
        assert vendor_response.status_code == 200
        vendor_data = vendor_response.json()
        assert len(vendor_data["offers"]) > 0, "Vendor should have at least one offer"
        offer_id = vendor_data["offers"][0]["offer_id"]
        print(f"✓ Got vendor with offer: {offer_id}")
        
        # 2. Generate QR as student
        qr_response = requests.post(f"{BASE_URL}/api/qr/generate", headers=self.student_headers, json={
            "vendor_id": self.vendor_id,
            "offer_id": offer_id
        })
        assert qr_response.status_code == 200
        qr_data = qr_response.json()
        assert "session_id" in qr_data
        assert "qr_data" in qr_data
        assert "discount" in qr_data
        session_id = qr_data["session_id"]
        print(f"✓ Generated QR: {session_id}, discount: {qr_data['discount']}%")
        
        # 3. Validate QR as vendor
        validate_response = requests.post(f"{BASE_URL}/api/qr/validate", headers=self.vendor_headers, json={
            "session_id": session_id
        })
        assert validate_response.status_code == 200
        validate_data = validate_response.json()
        assert validate_data["status"] == "success"
        assert "transaction_id" in validate_data
        assert "discount" in validate_data
        print(f"✓ QR validated, transaction: {validate_data['transaction_id']}")
        
        # 4. Verify transaction appears in student history
        history_response = requests.get(f"{BASE_URL}/api/transactions/my", headers=self.student_headers)
        assert history_response.status_code == 200
        history_data = history_response.json()
        assert len(history_data["transactions"]) > 0
        print(f"✓ Transaction appears in student history")
        
        # 5. Verify transaction appears in vendor activity
        vendor_txn_response = requests.get(f"{BASE_URL}/api/vendor/transactions", headers=self.vendor_headers)
        assert vendor_txn_response.status_code == 200
        vendor_txn_data = vendor_txn_response.json()
        assert len(vendor_txn_data["transactions"]) > 0
        print(f"✓ Transaction appears in vendor activity")
    
    def test_qr_cannot_be_reused(self):
        # Get vendor and offer
        vendor_response = requests.get(f"{BASE_URL}/api/vendors/{self.vendor_id}", headers=self.student_headers)
        offer_id = vendor_response.json()["offers"][0]["offer_id"]
        
        # Generate QR
        qr_response = requests.post(f"{BASE_URL}/api/qr/generate", headers=self.student_headers, json={
            "vendor_id": self.vendor_id,
            "offer_id": offer_id
        })
        session_id = qr_response.json()["session_id"]
        
        # First validation should succeed
        validate1 = requests.post(f"{BASE_URL}/api/qr/validate", headers=self.vendor_headers, json={
            "session_id": session_id
        })
        assert validate1.status_code == 200
        
        # Second validation should fail
        validate2 = requests.post(f"{BASE_URL}/api/qr/validate", headers=self.vendor_headers, json={
            "session_id": session_id
        })
        assert validate2.status_code == 400
        print("✓ QR code cannot be reused")


class TestLogout:
    """Logout tests"""
    
    def test_logout(self):
        # Login first
        login_response = requests.post(f"{BASE_URL}/api/auth/admin/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        token = login_response.json()["token"]
        
        # Logout
        logout_response = requests.post(f"{BASE_URL}/api/auth/logout", 
            headers={"Authorization": f"Bearer {token}"})
        assert logout_response.status_code == 200
        print("✓ Logout successful")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
