import os
import uuid
import httpx
from datetime import datetime, timezone, timedelta
from contextlib import asynccontextmanager
from pathlib import Path

from dotenv import load_dotenv
load_dotenv(Path(__file__).parent / ".env")

from fastapi import FastAPI, HTTPException, Request, Response, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
from pymongo import MongoClient
import bcrypt
import jwt

MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME")
JWT_SECRET = os.environ.get("JWT_SECRET", "artha_fallback_secret")
QR_EXPIRY_SECONDS = 30

# --- Database Setup ---
client = MongoClient(MONGO_URL)
db = client[DB_NAME]

# Collections
users_col = db["users"]
vendors_col = db["vendors"]
vendor_accounts_col = db["vendor_accounts"]
offers_col = db["offers"]
qr_sessions_col = db["qr_sessions"]
transactions_col = db["transactions"]
user_sessions_col = db["user_sessions"]
allowed_domains_col = db["allowed_domains"]

# --- Indexes ---
users_col.create_index("user_id", unique=True)
users_col.create_index("email", unique=True)
vendors_col.create_index("vendor_id", unique=True)
vendor_accounts_col.create_index("email", unique=True)
offers_col.create_index("offer_id", unique=True)
offers_col.create_index("vendor_id")
qr_sessions_col.create_index("session_id", unique=True)
qr_sessions_col.create_index("expires_at")
transactions_col.create_index("transaction_id", unique=True)
transactions_col.create_index("user_id")
transactions_col.create_index("vendor_id")
user_sessions_col.create_index("session_token", unique=True)
allowed_domains_col.create_index("domain", unique=True)


# --- Seed Data ---
def seed_data():
    # Seed admin
    admin_email = "admin@artha.com"
    existing_admin = users_col.find_one({"email": admin_email}, {"_id": 0})
    if not existing_admin:
        hashed = bcrypt.hashpw("admin123".encode(), bcrypt.gensalt()).decode()
        users_col.insert_one({
            "user_id": f"user_{uuid.uuid4().hex[:12]}",
            "email": admin_email,
            "name": "Artha Admin",
            "role": "admin",
            "password_hash": hashed,
            "verified": True,
            "college": "",
            "picture": "",
            "blocked": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        })

    # Seed allowed domains
    if allowed_domains_col.count_documents({}) == 0:
        allowed_domains_col.insert_many([
            {"domain": "bmsit.in", "added_at": datetime.now(timezone.utc).isoformat()},
            {"domain": "rvce.edu.in", "added_at": datetime.now(timezone.utc).isoformat()},
        ])

    # Seed sample vendors
    if vendors_col.count_documents({}) == 0:
        sample_vendors = [
            {"vendor_id": f"vendor_{uuid.uuid4().hex[:12]}", "name": "The Brew Room", "location": "100m from Main Gate", "category": "cafe", "description": "Artisan coffee and fresh pastries near campus.", "image": "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400", "active": True, "blocked": False, "created_at": datetime.now(timezone.utc).isoformat()},
            {"vendor_id": f"vendor_{uuid.uuid4().hex[:12]}", "name": "Campus Bites", "location": "200m from Gate 2", "category": "restaurant", "description": "Quick bites and affordable meals for students.", "image": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400", "active": True, "blocked": False, "created_at": datetime.now(timezone.utc).isoformat()},
            {"vendor_id": f"vendor_{uuid.uuid4().hex[:12]}", "name": "Fresh Prints", "location": "Inside Campus Block C", "category": "stationery", "description": "Stationery, printing, and photocopying services.", "image": "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=400", "active": True, "blocked": False, "created_at": datetime.now(timezone.utc).isoformat()},
            {"vendor_id": f"vendor_{uuid.uuid4().hex[:12]}", "name": "CleanWave Laundry", "location": "Behind Hostel Block", "category": "laundry", "description": "Same-day laundry and dry cleaning.", "image": "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=400", "active": True, "blocked": False, "created_at": datetime.now(timezone.utc).isoformat()},
            {"vendor_id": f"vendor_{uuid.uuid4().hex[:12]}", "name": "FitZone Gym", "location": "500m from Campus", "category": "gym", "description": "Student-friendly gym with modern equipment.", "image": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400", "active": True, "blocked": False, "created_at": datetime.now(timezone.utc).isoformat()},
        ]
        vendors_col.insert_many(sample_vendors)

        # Create vendor accounts for each
        for v in sample_vendors:
            email = v["name"].lower().replace(" ", "") + "@vendor.artha.com"
            hashed = bcrypt.hashpw("vendor123".encode(), bcrypt.gensalt()).decode()
            vendor_accounts_col.insert_one({
                "account_id": f"va_{uuid.uuid4().hex[:12]}",
                "vendor_id": v["vendor_id"],
                "email": email,
                "password_hash": hashed,
                "created_at": datetime.now(timezone.utc).isoformat()
            })

    # Seed sample offers
    if offers_col.count_documents({}) == 0:
        all_vendors = list(vendors_col.find({}, {"_id": 0, "vendor_id": 1, "name": 1}))
        sample_offers = []
        for v in all_vendors:
            sample_offers.append({
                "offer_id": f"offer_{uuid.uuid4().hex[:12]}",
                "vendor_id": v["vendor_id"],
                "vendor_name": v["name"],
                "discount": 15,
                "description": f"Get 15% off on all items at {v['name']}",
                "start_date": datetime.now(timezone.utc).isoformat(),
                "end_date": (datetime.now(timezone.utc) + timedelta(days=90)).isoformat(),
                "max_uses_per_user": 5,
                "total_uses": 0,
                "active": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            })
        if sample_offers:
            offers_col.insert_many(sample_offers)


@asynccontextmanager
async def lifespan(app: FastAPI):
    seed_data()
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Pydantic Models ---
class VendorLoginRequest(BaseModel):
    email: str
    password: str

class AdminLoginRequest(BaseModel):
    email: str
    password: str

class QRGenerateRequest(BaseModel):
    vendor_id: str
    offer_id: str

class QRValidateRequest(BaseModel):
    session_id: str

class VendorCreate(BaseModel):
    name: str
    location: str
    category: str
    description: str
    image: Optional[str] = ""
    email: Optional[str] = ""
    password: Optional[str] = "vendor123"

class VendorUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    image: Optional[str] = None
    active: Optional[bool] = None
    blocked: Optional[bool] = None

class OfferCreate(BaseModel):
    vendor_id: str
    discount: int
    description: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    max_uses_per_user: int = 5

class OfferUpdate(BaseModel):
    discount: Optional[int] = None
    description: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    max_uses_per_user: Optional[int] = None
    active: Optional[bool] = None

class DomainCreate(BaseModel):
    domain: str


# --- Auth Helpers ---
def create_jwt(payload: dict, expires_hours: int = 168) -> str:
    payload["exp"] = datetime.now(timezone.utc) + timedelta(hours=expires_hours)
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

def decode_jwt(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def get_current_user(request: Request) -> dict:
    # Check cookie first, then Authorization header
    token = request.cookies.get("session_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    # Check if it's a session token (from Google OAuth)
    session = user_sessions_col.find_one({"session_token": token}, {"_id": 0})
    if session:
        expires_at = session.get("expires_at")
        if isinstance(expires_at, str):
            expires_at = datetime.fromisoformat(expires_at)
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at < datetime.now(timezone.utc):
            raise HTTPException(status_code=401, detail="Session expired")
        user = users_col.find_one({"user_id": session["user_id"]}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user

    # Try JWT decode (for vendor/admin)
    payload = decode_jwt(token)
    role = payload.get("role", "")
    if role == "vendor":
        vendor_account = vendor_accounts_col.find_one({"account_id": payload.get("account_id")}, {"_id": 0})
        if not vendor_account:
            raise HTTPException(status_code=401, detail="Vendor account not found")
        vendor = vendors_col.find_one({"vendor_id": vendor_account["vendor_id"]}, {"_id": 0})
        if not vendor:
            raise HTTPException(status_code=401, detail="Vendor not found")
        return {
            "user_id": vendor_account["account_id"],
            "email": vendor_account["email"],
            "name": vendor.get("name", ""),
            "role": "vendor",
            "vendor_id": vendor["vendor_id"],
            "verified": True,
        }
    elif role == "admin":
        user = users_col.find_one({"user_id": payload.get("user_id")}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="Admin not found")
        return user

    raise HTTPException(status_code=401, detail="Invalid token")


def require_role(request: Request, *roles: str) -> dict:
    user = get_current_user(request)
    if user.get("role") not in roles:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    return user


# --- Health Check ---
@app.get("/api/health")
def health():
    return {"status": "ok", "app": "Artha"}


# ==========================================
# AUTH ENDPOINTS
# ==========================================

@app.post("/api/auth/session")
async def exchange_session(request: Request, response: Response):
    body = await request.json()
    session_id = body.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")

    # Call Emergent Auth to get user data
    async with httpx.AsyncClient() as client_http:
        resp = await client_http.get(
            "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
            headers={"X-Session-ID": session_id}
        )
        if resp.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid session")
        user_data = resp.json()

    email = user_data.get("email", "")
    session_token = user_data.get("session_token", "")

    # Check if email domain is allowed
    domain = email.split("@")[1] if "@" in email else ""
    allowed = allowed_domains_col.find_one({"domain": domain}, {"_id": 0})

    # Create or update user
    existing = users_col.find_one({"email": email}, {"_id": 0})
    if existing:
        users_col.update_one({"email": email}, {"$set": {
            "name": user_data.get("name", existing.get("name", "")),
            "picture": user_data.get("picture", existing.get("picture", "")),
        }})
        user_id = existing["user_id"]
        role = existing.get("role", "student")
    else:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        role = "student"
        users_col.insert_one({
            "user_id": user_id,
            "email": email,
            "name": user_data.get("name", ""),
            "role": role,
            "picture": user_data.get("picture", ""),
            "verified": bool(allowed),
            "college": domain.split(".")[0] if domain else "",
            "blocked": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        })

    # Store session
    user_sessions_col.delete_many({"user_id": user_id})
    user_sessions_col.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    })

    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=7 * 24 * 3600,
    )

    user = users_col.find_one({"user_id": user_id}, {"_id": 0, "password_hash": 0})
    return {"user": user, "token": session_token}


@app.get("/api/auth/me")
def get_me(request: Request):
    user = get_current_user(request)
    safe_user = {k: v for k, v in user.items() if k != "password_hash"}
    return safe_user


@app.post("/api/auth/vendor/login")
def vendor_login(req: VendorLoginRequest, response: Response):
    account = vendor_accounts_col.find_one({"email": req.email}, {"_id": 0})
    if not account:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not bcrypt.checkpw(req.password.encode(), account["password_hash"].encode()):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    vendor = vendors_col.find_one({"vendor_id": account["vendor_id"]}, {"_id": 0})
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    if vendor.get("blocked"):
        raise HTTPException(status_code=403, detail="Vendor account is blocked")

    token = create_jwt({"account_id": account["account_id"], "role": "vendor", "vendor_id": account["vendor_id"]})
    response.set_cookie(key="session_token", value=token, httponly=True, secure=True, samesite="none", path="/", max_age=7*24*3600)
    return {"token": token, "vendor": vendor, "role": "vendor"}


@app.post("/api/auth/admin/login")
def admin_login(req: AdminLoginRequest, response: Response):
    user = users_col.find_one({"email": req.email, "role": "admin"}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not bcrypt.checkpw(req.password.encode(), user.get("password_hash", "").encode()):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_jwt({"user_id": user["user_id"], "role": "admin"})
    response.set_cookie(key="session_token", value=token, httponly=True, secure=True, samesite="none", path="/", max_age=7*24*3600)
    safe_user = {k: v for k, v in user.items() if k != "password_hash"}
    return {"token": token, "user": safe_user, "role": "admin"}


@app.post("/api/auth/logout")
def logout(request: Request, response: Response):
    token = request.cookies.get("session_token")
    if token:
        user_sessions_col.delete_one({"session_token": token})
    response.delete_cookie("session_token", path="/")
    return {"message": "Logged out"}


# ==========================================
# STUDENT ENDPOINTS
# ==========================================

@app.get("/api/vendors")
def list_vendors(request: Request, search: str = "", category: str = ""):
    user = get_current_user(request)
    query = {"active": True, "blocked": False}
    if search:
        query["name"] = {"$regex": search, "$options": "i"}
    if category:
        query["category"] = category

    vendors = list(vendors_col.find(query, {"_id": 0}))
    # Attach offer count to each vendor
    for v in vendors:
        v["offer_count"] = offers_col.count_documents({"vendor_id": v["vendor_id"], "active": True})
    return {"vendors": vendors}


@app.get("/api/vendors/{vendor_id}")
def get_vendor(vendor_id: str, request: Request):
    user = get_current_user(request)
    vendor = vendors_col.find_one({"vendor_id": vendor_id}, {"_id": 0})
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    offers = list(offers_col.find({"vendor_id": vendor_id, "active": True}, {"_id": 0}))
    return {"vendor": vendor, "offers": offers}


# ==========================================
# QR SYSTEM
# ==========================================

@app.post("/api/qr/generate")
def generate_qr(req: QRGenerateRequest, request: Request):
    user = require_role(request, "student")
    # Verify vendor and offer exist
    vendor = vendors_col.find_one({"vendor_id": req.vendor_id, "active": True}, {"_id": 0})
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    offer = offers_col.find_one({"offer_id": req.offer_id, "active": True}, {"_id": 0})
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")

    # Check usage limit
    usage_count = transactions_col.count_documents({
        "user_id": user["user_id"],
        "offer_id": req.offer_id
    })
    if usage_count >= offer.get("max_uses_per_user", 5):
        raise HTTPException(status_code=400, detail="You've reached the maximum usage for this offer")

    session_id = f"qr_{uuid.uuid4().hex}"
    expires_at = datetime.now(timezone.utc) + timedelta(seconds=QR_EXPIRY_SECONDS)

    qr_sessions_col.insert_one({
        "session_id": session_id,
        "user_id": user["user_id"],
        "user_name": user.get("name", ""),
        "vendor_id": req.vendor_id,
        "offer_id": req.offer_id,
        "discount": offer.get("discount", 0),
        "expires_at": expires_at.isoformat(),
        "used": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    })

    return {
        "session_id": session_id,
        "expires_at": expires_at.isoformat(),
        "qr_data": session_id,
        "discount": offer.get("discount", 0),
        "vendor_name": vendor.get("name", ""),
    }


@app.post("/api/qr/validate")
def validate_qr(req: QRValidateRequest, request: Request):
    user = require_role(request, "vendor")
    vendor_id = user.get("vendor_id")

    session = qr_sessions_col.find_one({"session_id": req.session_id}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=404, detail="Invalid QR code")
    if session.get("used"):
        raise HTTPException(status_code=400, detail="QR code already used")
    if session.get("vendor_id") != vendor_id:
        raise HTTPException(status_code=400, detail="QR code is not for this vendor")

    expires_at = session.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="QR code has expired")

    # Mark as used
    qr_sessions_col.update_one({"session_id": req.session_id}, {"$set": {"used": True}})

    # Create transaction
    transaction_id = f"txn_{uuid.uuid4().hex[:12]}"
    vendor = vendors_col.find_one({"vendor_id": vendor_id}, {"_id": 0})
    student = users_col.find_one({"user_id": session["user_id"]}, {"_id": 0})

    transactions_col.insert_one({
        "transaction_id": transaction_id,
        "user_id": session["user_id"],
        "user_name": student.get("name", "") if student else session.get("user_name", ""),
        "user_email": student.get("email", "") if student else "",
        "vendor_id": vendor_id,
        "vendor_name": vendor.get("name", "") if vendor else "",
        "offer_id": session.get("offer_id", ""),
        "discount": session.get("discount", 0),
        "qr_session_id": req.session_id,
        "timestamp": datetime.now(timezone.utc).isoformat()
    })

    # Update offer usage
    offers_col.update_one({"offer_id": session.get("offer_id")}, {"$inc": {"total_uses": 1}})

    return {
        "status": "success",
        "message": "Discount applied successfully",
        "transaction_id": transaction_id,
        "discount": session.get("discount", 0),
        "student_name": student.get("name", "") if student else session.get("user_name", ""),
    }


# ==========================================
# TRANSACTION ENDPOINTS
# ==========================================

@app.get("/api/transactions/my")
def my_transactions(request: Request):
    user = require_role(request, "student")
    txns = list(transactions_col.find({"user_id": user["user_id"]}, {"_id": 0}).sort("timestamp", -1).limit(50))
    return {"transactions": txns}


@app.get("/api/vendor/transactions")
def vendor_transactions(request: Request):
    user = require_role(request, "vendor")
    txns = list(transactions_col.find({"vendor_id": user.get("vendor_id")}, {"_id": 0}).sort("timestamp", -1).limit(50))
    return {"transactions": txns}


@app.get("/api/vendor/dashboard")
def vendor_dashboard(request: Request):
    user = require_role(request, "vendor")
    vendor_id = user.get("vendor_id")
    total_scans = transactions_col.count_documents({"vendor_id": vendor_id})
    unique_users = len(transactions_col.distinct("user_id", {"vendor_id": vendor_id}))
    recent = list(transactions_col.find({"vendor_id": vendor_id}, {"_id": 0}).sort("timestamp", -1).limit(10))
    vendor = vendors_col.find_one({"vendor_id": vendor_id}, {"_id": 0})
    offers = list(offers_col.find({"vendor_id": vendor_id}, {"_id": 0}))

    return {
        "vendor": vendor,
        "total_scans": total_scans,
        "unique_users": unique_users,
        "recent_transactions": recent,
        "offers": offers,
    }


# ==========================================
# ADMIN ENDPOINTS
# ==========================================

@app.get("/api/admin/dashboard")
def admin_dashboard(request: Request):
    user = require_role(request, "admin")
    return {
        "total_users": users_col.count_documents({"role": "student"}),
        "total_vendors": vendors_col.count_documents({}),
        "total_offers": offers_col.count_documents({}),
        "total_transactions": transactions_col.count_documents({}),
        "active_vendors": vendors_col.count_documents({"active": True, "blocked": False}),
        "recent_transactions": list(transactions_col.find({}, {"_id": 0}).sort("timestamp", -1).limit(10)),
    }


# --- Admin Vendor CRUD ---
@app.get("/api/admin/vendors")
def admin_list_vendors(request: Request):
    user = require_role(request, "admin")
    vendors = list(vendors_col.find({}, {"_id": 0}))
    for v in vendors:
        account = vendor_accounts_col.find_one({"vendor_id": v["vendor_id"]}, {"_id": 0, "password_hash": 0})
        v["account"] = account
        v["offer_count"] = offers_col.count_documents({"vendor_id": v["vendor_id"]})
        v["transaction_count"] = transactions_col.count_documents({"vendor_id": v["vendor_id"]})
    return {"vendors": vendors}


@app.post("/api/admin/vendors")
def admin_create_vendor(req: VendorCreate, request: Request):
    user = require_role(request, "admin")
    vendor_id = f"vendor_{uuid.uuid4().hex[:12]}"
    vendors_col.insert_one({
        "vendor_id": vendor_id,
        "name": req.name,
        "location": req.location,
        "category": req.category,
        "description": req.description,
        "image": req.image or "",
        "active": True,
        "blocked": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    })

    # Create vendor account
    email = req.email or (req.name.lower().replace(" ", "") + "@vendor.artha.com")
    hashed = bcrypt.hashpw((req.password or "vendor123").encode(), bcrypt.gensalt()).decode()
    vendor_accounts_col.insert_one({
        "account_id": f"va_{uuid.uuid4().hex[:12]}",
        "vendor_id": vendor_id,
        "email": email,
        "password_hash": hashed,
        "created_at": datetime.now(timezone.utc).isoformat()
    })

    vendor = vendors_col.find_one({"vendor_id": vendor_id}, {"_id": 0})
    return {"vendor": vendor, "message": "Vendor created"}


@app.put("/api/admin/vendors/{vendor_id}")
def admin_update_vendor(vendor_id: str, req: VendorUpdate, request: Request):
    user = require_role(request, "admin")
    updates = {k: v for k, v in req.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    vendors_col.update_one({"vendor_id": vendor_id}, {"$set": updates})
    vendor = vendors_col.find_one({"vendor_id": vendor_id}, {"_id": 0})
    return {"vendor": vendor, "message": "Vendor updated"}


@app.delete("/api/admin/vendors/{vendor_id}")
def admin_delete_vendor(vendor_id: str, request: Request):
    user = require_role(request, "admin")
    vendors_col.delete_one({"vendor_id": vendor_id})
    vendor_accounts_col.delete_many({"vendor_id": vendor_id})
    offers_col.delete_many({"vendor_id": vendor_id})
    return {"message": "Vendor deleted"}


# --- Admin Offer CRUD ---
@app.get("/api/admin/offers")
def admin_list_offers(request: Request):
    user = require_role(request, "admin")
    offers = list(offers_col.find({}, {"_id": 0}))
    return {"offers": offers}


@app.post("/api/admin/offers")
def admin_create_offer(req: OfferCreate, request: Request):
    user = require_role(request, "admin")
    vendor = vendors_col.find_one({"vendor_id": req.vendor_id}, {"_id": 0})
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")

    offer_id = f"offer_{uuid.uuid4().hex[:12]}"
    offers_col.insert_one({
        "offer_id": offer_id,
        "vendor_id": req.vendor_id,
        "vendor_name": vendor["name"],
        "discount": req.discount,
        "description": req.description,
        "start_date": req.start_date or datetime.now(timezone.utc).isoformat(),
        "end_date": req.end_date or (datetime.now(timezone.utc) + timedelta(days=30)).isoformat(),
        "max_uses_per_user": req.max_uses_per_user,
        "total_uses": 0,
        "active": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    })

    offer = offers_col.find_one({"offer_id": offer_id}, {"_id": 0})
    return {"offer": offer, "message": "Offer created"}


@app.put("/api/admin/offers/{offer_id}")
def admin_update_offer(offer_id: str, req: OfferUpdate, request: Request):
    user = require_role(request, "admin")
    updates = {k: v for k, v in req.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    offers_col.update_one({"offer_id": offer_id}, {"$set": updates})
    offer = offers_col.find_one({"offer_id": offer_id}, {"_id": 0})
    return {"offer": offer, "message": "Offer updated"}


@app.delete("/api/admin/offers/{offer_id}")
def admin_delete_offer(offer_id: str, request: Request):
    user = require_role(request, "admin")
    offers_col.delete_one({"offer_id": offer_id})
    return {"message": "Offer deleted"}


# --- Admin Transactions ---
@app.get("/api/admin/transactions")
def admin_list_transactions(request: Request):
    user = require_role(request, "admin")
    txns = list(transactions_col.find({}, {"_id": 0}).sort("timestamp", -1).limit(100))
    return {"transactions": txns}


# --- Admin Domain Management ---
@app.get("/api/admin/domains")
def admin_list_domains(request: Request):
    user = require_role(request, "admin")
    domains = list(allowed_domains_col.find({}, {"_id": 0}))
    return {"domains": domains}


@app.post("/api/admin/domains")
def admin_add_domain(req: DomainCreate, request: Request):
    user = require_role(request, "admin")
    existing = allowed_domains_col.find_one({"domain": req.domain})
    if existing:
        raise HTTPException(status_code=400, detail="Domain already exists")
    allowed_domains_col.insert_one({
        "domain": req.domain,
        "added_at": datetime.now(timezone.utc).isoformat()
    })
    return {"message": "Domain added", "domain": req.domain}


@app.delete("/api/admin/domains/{domain}")
def admin_delete_domain(domain: str, request: Request):
    user = require_role(request, "admin")
    allowed_domains_col.delete_one({"domain": domain})
    return {"message": "Domain removed"}


# --- Admin Users ---
@app.get("/api/admin/users")
def admin_list_users(request: Request):
    user = require_role(request, "admin")
    users = list(users_col.find({"role": "student"}, {"_id": 0, "password_hash": 0}))
    return {"users": users}
