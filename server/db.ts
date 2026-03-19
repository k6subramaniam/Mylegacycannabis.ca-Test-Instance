import { eq, desc, asc, sql, and, like, or, inArray, gte, lte, count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users,
  products, InsertProduct, Product,
  orders, InsertOrder, Order,
  orderItems, InsertOrderItem,
  idVerifications, InsertIdVerification,
  shippingZones, InsertShippingZone,
  emailTemplates, InsertEmailTemplate,
  adminActivityLog, InsertAdminActivityLog,
  rewardsHistory, InsertRewardsHistory,
  verificationCodes, InsertVerificationCode,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── USER HELPERS ───
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod", "phone", "birthday"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
    if (user.authMethod !== undefined) { values.authMethod = user.authMethod; updateSet.authMethod = user.authMethod; }
    if (user.rewardPoints !== undefined) { values.rewardPoints = user.rewardPoints; updateSet.rewardPoints = user.rewardPoints; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) { console.error("[Database] Failed to upsert user:", error); throw error; }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers(page = 1, limit = 50) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  const offset = (page - 1) * limit;
  const [data, [{ total }]] = await Promise.all([
    db.select().from(users).orderBy(desc(users.createdAt)).limit(limit).offset(offset),
    db.select({ total: count() }).from(users),
  ]);
  return { data, total };
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByPhone(phone: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByGoogleId(googleId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.googleId, googleId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUser(id: number, data: Partial<InsertUser>) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set(data as any).where(eq(users.id, id));
}

// ─── OTP / VERIFICATION CODE HELPERS ───
export async function createVerificationCode(data: { identifier: string; code: string; type: "sms" | "email"; purpose: "login" | "register" | "verify"; expiresAt: Date }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Invalidate any existing unused codes for this identifier+type+purpose
  await db.update(verificationCodes)
    .set({ verified: true })
    .where(and(
      eq(verificationCodes.identifier, data.identifier),
      eq(verificationCodes.type, data.type),
      eq(verificationCodes.verified, false)
    ));
  const result = await db.insert(verificationCodes).values(data);
  return Number(result[0].insertId);
}

export async function verifyCode(identifier: string, code: string, type: "sms" | "email"): Promise<{ valid: boolean; reason?: string }> {
  const db = await getDb();
  if (!db) return { valid: false, reason: "Database not available" };
  const results = await db.select().from(verificationCodes)
    .where(and(
      eq(verificationCodes.identifier, identifier),
      eq(verificationCodes.type, type),
      eq(verificationCodes.verified, false)
    ))
    .orderBy(desc(verificationCodes.createdAt))
    .limit(1);
  if (results.length === 0) return { valid: false, reason: "No verification code found. Please request a new code." };
  const record = results[0];
  if (new Date() > record.expiresAt) {
    await db.update(verificationCodes).set({ verified: true }).where(eq(verificationCodes.id, record.id));
    return { valid: false, reason: "Code has expired. Please request a new one." };
  }
  if (record.attempts >= 5) {
    await db.update(verificationCodes).set({ verified: true }).where(eq(verificationCodes.id, record.id));
    return { valid: false, reason: "Too many attempts. Please request a new code." };
  }
  if (record.code !== code) {
    await db.update(verificationCodes).set({ attempts: record.attempts + 1 }).where(eq(verificationCodes.id, record.id));
    return { valid: false, reason: `Incorrect code. ${4 - record.attempts} attempts remaining.` };
  }
  // Mark as verified
  await db.update(verificationCodes).set({ verified: true }).where(eq(verificationCodes.id, record.id));
  return { valid: true };
}

// ─── PRODUCT HELPERS ───
export async function getAllProducts(opts?: { page?: number; limit?: number; category?: string; search?: string; activeOnly?: boolean }) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  const page = opts?.page ?? 1;
  const limit = opts?.limit ?? 50;
  const offset = (page - 1) * limit;
  const conditions = [];
  if (opts?.category) conditions.push(eq(products.category, opts.category as any));
  if (opts?.activeOnly) conditions.push(eq(products.isActive, true));
  if (opts?.search) conditions.push(or(like(products.name, `%${opts.search}%`), like(products.slug, `%${opts.search}%`)));
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const [data, [{ total }]] = await Promise.all([
    db.select().from(products).where(where).orderBy(desc(products.createdAt)).limit(limit).offset(offset),
    db.select({ total: count() }).from(products).where(where),
  ]);
  return { data, total };
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result[0];
}

export async function getProductBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  return result[0];
}

export async function createProduct(data: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(products).values(data);
  return result[0].insertId;
}

export async function updateProduct(id: number, data: Partial<InsertProduct>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(products).set(data).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.delete(products).where(eq(products.id, id));
}

// ─── ORDER HELPERS ───
export async function getAllOrders(opts?: { page?: number; limit?: number; status?: string; search?: string; dateFrom?: Date; dateTo?: Date }) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  const page = opts?.page ?? 1;
  const limit = opts?.limit ?? 50;
  const offset = (page - 1) * limit;
  const conditions = [];
  if (opts?.status) conditions.push(eq(orders.status, opts.status as any));
  if (opts?.search) conditions.push(or(like(orders.orderNumber, `%${opts.search}%`), like(orders.guestEmail, `%${opts.search}%`), like(orders.guestName, `%${opts.search}%`)));
  if (opts?.dateFrom) conditions.push(gte(orders.createdAt, opts.dateFrom));
  if (opts?.dateTo) conditions.push(lte(orders.createdAt, opts.dateTo));
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const [data, [{ total }]] = await Promise.all([
    db.select().from(orders).where(where).orderBy(desc(orders.createdAt)).limit(limit).offset(offset),
    db.select({ total: count() }).from(orders).where(where),
  ]);
  return { data, total };
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result[0];
}

export async function getOrderItems(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

export async function createOrder(data: InsertOrder) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(orders).values(data);
  return result[0].insertId;
}

export async function createOrderItems(items: InsertOrderItem[]) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(orderItems).values(items);
}

export async function updateOrder(id: number, data: Partial<InsertOrder>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(orders).set(data).where(eq(orders.id, id));
}

// ─── ID VERIFICATION HELPERS ───
export async function getAllVerifications(opts?: { page?: number; limit?: number; status?: string }) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  const page = opts?.page ?? 1;
  const limit = opts?.limit ?? 50;
  const offset = (page - 1) * limit;
  const conditions = [];
  if (opts?.status) conditions.push(eq(idVerifications.status, opts.status as any));
  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const [data, [{ total }]] = await Promise.all([
    db.select().from(idVerifications).where(where).orderBy(desc(idVerifications.createdAt)).limit(limit).offset(offset),
    db.select({ total: count() }).from(idVerifications).where(where),
  ]);
  return { data, total };
}

export async function getVerificationById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(idVerifications).where(eq(idVerifications.id, id)).limit(1);
  return result[0];
}

export async function createVerification(data: InsertIdVerification) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(idVerifications).values(data);
  return result[0].insertId;
}

export async function updateVerification(id: number, data: Partial<InsertIdVerification>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(idVerifications).set(data).where(eq(idVerifications.id, id));
}

// ─── SHIPPING ZONE HELPERS ───
export async function getAllShippingZones() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(shippingZones).orderBy(asc(shippingZones.id));
}

export async function updateShippingZone(id: number, data: Partial<InsertShippingZone>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(shippingZones).set(data).where(eq(shippingZones.id, id));
}

export async function createShippingZone(data: InsertShippingZone) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(shippingZones).values(data);
  return result[0].insertId;
}

// ─── EMAIL TEMPLATE HELPERS ───
export async function getAllEmailTemplates() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(emailTemplates).orderBy(asc(emailTemplates.slug));
}

export async function getEmailTemplateBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(emailTemplates).where(eq(emailTemplates.slug, slug)).limit(1);
  return result[0];
}

export async function updateEmailTemplate(id: number, data: Partial<InsertEmailTemplate>) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.update(emailTemplates).set(data).where(eq(emailTemplates.id, id));
}

export async function createEmailTemplate(data: InsertEmailTemplate) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(emailTemplates).values(data);
  return result[0].insertId;
}

// ─── ADMIN ACTIVITY LOG ───
export async function logAdminActivity(data: InsertAdminActivityLog) {
  const db = await getDb();
  if (!db) return;
  await db.insert(adminActivityLog).values(data);
}

export async function getAdminActivityLog(opts?: { page?: number; limit?: number }) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  const page = opts?.page ?? 1;
  const limit = opts?.limit ?? 50;
  const offset = (page - 1) * limit;
  const [data, [{ total }]] = await Promise.all([
    db.select().from(adminActivityLog).orderBy(desc(adminActivityLog.createdAt)).limit(limit).offset(offset),
    db.select({ total: count() }).from(adminActivityLog),
  ]);
  return { data, total };
}

// ─── REWARDS HISTORY ───
export async function addRewardsHistory(data: InsertRewardsHistory) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  await db.insert(rewardsHistory).values(data);
}

export async function getRewardsHistoryByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(rewardsHistory).where(eq(rewardsHistory.userId, userId)).orderBy(desc(rewardsHistory.createdAt));
}

// ─── DASHBOARD STATS ───
export async function getDashboardStats() {
  const db = await getDb();
  if (!db) return { totalOrders: 0, totalRevenue: 0, pendingVerifications: 0, totalProducts: 0, totalUsers: 0, recentOrders: [] };
  const [
    [{ totalOrders }],
    [{ totalRevenue }],
    [{ pendingVerifications }],
    [{ totalProducts }],
    [{ totalUsers }],
    recentOrders,
  ] = await Promise.all([
    db.select({ totalOrders: count() }).from(orders),
    db.select({ totalRevenue: sql<string>`COALESCE(SUM(${orders.total}), 0)` }).from(orders).where(eq(orders.paymentStatus, "confirmed")),
    db.select({ pendingVerifications: count() }).from(idVerifications).where(eq(idVerifications.status, "pending")),
    db.select({ totalProducts: count() }).from(products).where(eq(products.isActive, true)),
    db.select({ totalUsers: count() }).from(users),
    db.select().from(orders).orderBy(desc(orders.createdAt)).limit(10),
  ]);
  return { totalOrders, totalRevenue: Number(totalRevenue), pendingVerifications, totalProducts, totalUsers, recentOrders };
}

export async function getOrderStats(days = 30) {
  const db = await getDb();
  if (!db) return [];
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days);
  return db.select({
    date: sql<string>`DATE(${orders.createdAt})`,
    orderCount: count(),
    revenue: sql<string>`COALESCE(SUM(${orders.total}), 0)`,
  }).from(orders).where(gte(orders.createdAt, fromDate)).groupBy(sql`DATE(${orders.createdAt})`).orderBy(sql`DATE(${orders.createdAt})`);
}

export async function getTopProducts(limit = 10) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    productName: orderItems.productName,
    totalSold: sql<number>`SUM(${orderItems.quantity})`,
    totalRevenue: sql<string>`SUM(${orderItems.price} * ${orderItems.quantity})`,
  }).from(orderItems).groupBy(orderItems.productName).orderBy(sql`SUM(${orderItems.quantity}) DESC`).limit(limit);
}
