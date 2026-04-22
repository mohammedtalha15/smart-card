# Artha - Product Requirements Document

## Original Problem Statement
Build "Artha" - a verified student network that unlocks real-world value through exclusive benefits at local vendors. Connects Students, Vendors, and Admin with QR-based discount redemption system.

## Architecture
- **Frontend**: React (CRA) + TypeScript + Tailwind CSS on port 3000
- **Backend**: FastAPI (Python) on port 8001
- **Database**: MongoDB (artha_db)
- **Auth**: Emergent Google OAuth (students) + JWT email/password (vendors & admin)

## User Personas
1. **Student**: College student with verified email, browses vendors, generates QR codes for discounts
2. **Vendor**: Business owner, scans student QR codes to apply discounts, views dashboard stats
3. **Admin**: Platform administrator, manages vendors, offers, domains, and monitors transactions

## Core Requirements
- Role-based access control (student/vendor/admin)
- QR code generation with 30-second expiry and countdown timer
- QR validation (prevents reuse, checks expiry)
- Configurable student email domain allowlist
- Vendor CRUD management by admin
- Offer CRUD management by admin
- Transaction tracking across all roles

## What's Been Implemented (Jan 22, 2026)

### Backend (/app/backend/server.py)
- Health check endpoint
- Auth: Google OAuth session exchange, vendor login, admin login, logout, /me endpoint
- Student: List vendors (with search/filter), vendor detail with offers
- QR System: Generate QR (30-sec TTL), Validate QR (checks expiry, reuse, vendor match)
- Transactions: Student history, vendor history
- Admin: Dashboard stats, vendor CRUD, offer CRUD, transaction list, domain CRUD, user list
- Seed data: 1 admin, 5 vendors, 5 offers, 2 domains

### Frontend (/app/frontend/src/)
- Login page with Student/Vendor/Admin tabs
- Auth callback for Google OAuth
- Student Dashboard with vendor grid, search, category filters
- Vendor Detail page with offers list and "Get Discount" button
- QR Page with QR code display, countdown timer, regeneration
- Transaction History page
- Vendor Portal dashboard with stats
- Vendor QR Scanner (camera + manual entry)
- Admin Dashboard with platform stats
- Admin Vendors management (CRUD with modal forms)
- Admin Offers management (CRUD)
- Admin Transactions table
- Admin Domains management (add/remove)
- Sidebar layout with role-based navigation

### Design
- Minimal, monochrome, premium (Stripe/Notion-inspired)
- Cabinet Grotesk (headings) + Manrope (body) fonts
- Light theme, zinc color palette, 1px borders
- Responsive sidebar layout

## Testing
- 23/23 backend API tests passed
- All frontend UI flows validated
- Test credentials in /app/memory/test_credentials.md

## Prioritized Backlog

### P0 (Critical)
- (Done) All core features implemented

### P1 (High)
- Student profile page
- Vendor profile editing
- Email notifications for new offers
- Analytics dashboard for admin

### P2 (Medium)
- Distance-based vendor sorting (geolocation)
- Offer scheduling (time-of-day active hours)
- Student ratings/reviews for vendors
- Export transactions to CSV

### P3 (Low/Future)
- Mobile app (React Native)
- Push notifications
- Vendor self-registration portal
- Multi-campus support
- Referral program for students
