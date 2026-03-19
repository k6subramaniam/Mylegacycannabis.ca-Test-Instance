# Admin Dashboard Build — Todo

## Phase 1: Upgrade to Full-Stack
- [x] Run webdev_add_feature for web-db-user
- [x] Review generated schema and server setup

## Phase 2: Database Schema
- [x] Create products table
- [x] Create orders table
- [x] Create order_items table
- [x] Create id_verifications table
- [x] Create email_templates table
- [x] Create shipping_zones table
- [x] Create admin_activity_log table
- [x] Seed initial data (products, shipping zones, email templates)

## Phase 3: Admin Layout & Auth
- [x] Create admin layout with sidebar navigation
- [x] Admin auth guard (check user role)
- [x] Dashboard overview page (stats cards, recent orders, pending verifications)

## Phase 4: Product Management
- [x] Product list with search, filter, pagination
- [x] Add/edit product form (all fields)
- [x] Delete product with confirmation

## Phase 5: Order Management
- [x] Order list with filters (status, date range, search)
- [x] Order detail view (items, customer info, shipping, payment)
- [x] Order status workflow (pending → processing → shipped → delivered / cancelled)
- [x] Add tracking number and order notes

## Phase 6: ID Verification Review
- [x] Pending verifications queue
- [x] Document viewer (front ID, selfie)
- [x] Approve/reject with notes

## Phase 7: Shipping, Email Templates, Notifications
- [x] Shipping zone configuration (edit rates, delivery times)
- [x] Email template editor with preview
- [x] Notification log via admin activity log

## Phase 8: Reporting & Customers
- [x] Revenue summary, order stats, product counts
- [x] Customers page with user list and search
- [x] Vitest tests for all admin routes (10 tests passing)

## Phase 9: Custom Authentication System
- [x] Update users table with phone, birthday, googleId, idVerified fields
- [x] Create verification_codes table for OTP
- [x] Build email OTP send/verify backend routes (FREE via built-in notification)
- [x] Build SMS OTP send/verify backend routes (pluggable, logged for testing)
- [x] Build Google OAuth backend route (placeholder)
- [x] Build registration backend route (name, email, phone mandatory, birthday)
- [x] Build complete-profile route for Google users to add phone
- [x] Build Login page UI (email, phone, Google options)
- [x] Build Register page UI (3-step: info, verify email, done)
- [x] Build Complete Profile page UI (for Google users)
- [x] Build OTP input component (6-digit code entry)
- [x] Add routes to App.tsx (login, register, complete-profile)
- [x] Write vitest tests for auth validation (17 total tests passing)
