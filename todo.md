# Admin Dashboard Build — Todo

## Phase 1: Upgrade to Full-Stack
- [x] Run webdev_add_feature for web-db-user
- [x] Review generated schema and server setup

## Phase 2: Database Schema
- [x] Create products table (name, slug, category, strain, price, weight, thc, description, image, stock, featured, new)
- [x] Create orders table (order_number, user_id, guest_email, status, subtotal, shipping, discount, total, shipping_address, payment_status, tracking_number, notes)
- [x] Create order_items table (order_id, product_id, quantity, price)
- [x] Create id_verifications table (user_id, guest_email, front_image, selfie_image, status, reviewed_by, reviewed_at, notes)
- [x] Create email_templates table (slug, name, subject, body_html, variables)
- [x] Create shipping_zones table (zone_name, provinces, rate, delivery_days, active)
- [x] Create admin_activity_log table (admin_id, action, entity_type, entity_id, details)
- [x] Seed initial data (products, shipping zones, email templates)

## Phase 3: Admin Layout & Auth
- [x] Create admin layout with sidebar navigation
- [x] Admin auth guard (check user role)
- [x] Dashboard overview page (stats cards, recent orders, pending verifications)

## Phase 4: Product Management
- [x] Product list with search, filter, pagination
- [x] Add/edit product form (all fields)
- [x] Delete product with confirmation
- [x] Bulk actions (activate/deactivate, update stock)

## Phase 5: Order Management
- [x] Order list with filters (status, date range, search)
- [x] Order detail view (items, customer info, shipping, payment)
- [x] Order status workflow (pending → processing → shipped → delivered / cancelled)
- [x] Add tracking number
- [x] Order notes

## Phase 6: ID Verification Review
- [x] Pending verifications queue
- [x] Document viewer (front ID, selfie)
- [x] Approve/reject with notes
- [x] Verification history

## Phase 7: Shipping, Email Templates, Notifications
- [x] Shipping zone configuration (edit rates, delivery times)
- [x] Email template editor (order confirmation, shipped, delivered, ID approved/rejected)
- [x] Notification log (via admin activity log)

## Phase 8: Reporting
- [x] Revenue summary (gross revenue, avg order value)
- [x] Order status breakdown
- [x] Products listed count
- [x] Customer stats

## Phase 9: Additional Admin Pages
- [x] Customers page with user list and search
- [x] Reports & Analytics page with key metrics
- [x] Vitest tests for all admin routes (10 tests passing)
- [x] Admin routing integrated into App.tsx
