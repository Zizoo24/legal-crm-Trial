import { eq, desc, sql, and, gte, lte, count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, enquiries, InsertEnquiry, payments, InsertPayment, Enquiry } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;
let _idGenerationLock: Promise<void> | null = null;

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

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ ENQUIRY FUNCTIONS ============

/**
 * Generate next enquiry ID in format ENQ-0001
 * Uses a simple lock to prevent race conditions in tests
 */
export async function generateEnquiryId(): Promise<string> {
  // Wait for any pending ID generation to complete
  while (_idGenerationLock) {
    await _idGenerationLock;
  }

  // Create a new lock
  let releaseLock: () => void;
  _idGenerationLock = new Promise(resolve => { releaseLock = resolve; });

  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Use MAX(id) to get the highest ID, which is safe even with deletions
    const result = await db
      .select({ maxId: sql<number>`COALESCE(MAX(${enquiries.id}), 0)` })
      .from(enquiries);

    const nextNumber = (result[0]?.maxId || 0) + 1;
    return `ENQ-${String(nextNumber).padStart(4, '0')}`;
  } finally {
    // Release the lock
    _idGenerationLock = null;
    releaseLock!();
  }
}

/**
 * Generate matter code in format MAT-YYYY-001
 */
export async function generateMatterCode(conversionDate: Date): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const year = conversionDate.getFullYear();
  
  // Count matters converted in this year
  const startOfYear = new Date(year, 0, 1);
  const endOfYear = new Date(year, 11, 31);
  
  const result = await db
    .select({ count: count() })
    .from(enquiries)
    .where(
      and(
        sql`${enquiries.conversionDate} >= ${startOfYear.toISOString().split('T')[0]}`,
        sql`${enquiries.conversionDate} <= ${endOfYear.toISOString().split('T')[0]}`
      )
    );

  const nextNumber = (result[0]?.count || 0) + 1;
  return `MAT-${year}-${String(nextNumber).padStart(3, '0')}`;
}

/**
 * Create a new enquiry
 */
export async function createEnquiry(data: Record<string, any>, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const enquiryId = await generateEnquiryId();
  
  const insertData = {
    ...data,
    enquiryId,
    createdBy: userId,
  };

  const [result] = await db.insert(enquiries).values(insertData as any);
  // Get the last inserted ID from the database
  const [idResult] = await db.select({ id: sql<number>`LAST_INSERT_ID()` }).from(enquiries).limit(1);
  const insertedId = idResult?.id || 0;
  return { id: insertedId, enquiryId };
}

/**
 * Update an enquiry
 */
export async function updateEnquiry(id: number, data: Record<string, any>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // If conversion date is being set and matter code doesn't exist, generate it
  if (data.conversionDate && !data.matterCode) {
    const conversionDate = typeof data.conversionDate === 'string' 
      ? new Date(data.conversionDate) 
      : data.conversionDate;
    data.matterCode = await generateMatterCode(conversionDate);
  }

  await db.update(enquiries).set(data).where(eq(enquiries.id, id));
  
  return await getEnquiryById(id);
}

/**
 * Get all enquiries
 */
export async function getAllEnquiries() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select().from(enquiries).orderBy(desc(enquiries.createdAt));
}

/**
 * Get enquiry by ID
 */
export async function getEnquiryById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(enquiries).where(eq(enquiries.id, id)).limit(1);
  return result[0] || null;
}

/**
 * Get enquiries by status
 */
export async function getEnquiriesByStatus(status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select().from(enquiries).where(eq(enquiries.currentStatus, status));
}

/**
 * Delete enquiry
 */
export async function deleteEnquiry(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(enquiries).where(eq(enquiries.id, id));
}

// ============ PAYMENT FUNCTIONS ============

/**
 * Create payment record
 */
export async function createPayment(data: Record<string, any>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [result] = await db.insert(payments).values(data as any);
  // Get the last inserted ID from the database
  const [idResult] = await db.select({ id: sql<number>`LAST_INSERT_ID()` }).from(payments).limit(1);
  const insertedId = idResult?.id || 0;
  return { id: insertedId };
}

/**
 * Update payment
 */
export async function updatePayment(id: number, data: Record<string, any>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(payments).set(data).where(eq(payments.id, id));
  return await getPaymentById(id);
}

/**
 * Get payment by enquiry ID
 */
export async function getPaymentByEnquiryId(enquiryId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(payments).where(eq(payments.enquiryId, enquiryId)).limit(1);
  return result[0] || null;
}

/**
 * Get payment by ID
 */
export async function getPaymentById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(payments).where(eq(payments.id, id)).limit(1);
  return result[0] || null;
}

/**
 * Get all payments
 */
export async function getAllPayments() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.select().from(payments).orderBy(desc(payments.createdAt));
}

// ============ DASHBOARD FUNCTIONS ============

/**
 * Get status summary for Status Tracker
 */
export async function getStatusSummary() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select({
      status: enquiries.currentStatus,
      count: count(),
    })
    .from(enquiries)
    .groupBy(enquiries.currentStatus);

  return result;
}

/**
 * Get KPI metrics
 */
export async function getKPIMetrics() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Total enquiries
  const totalResult = await db.select({ count: count() }).from(enquiries);
  const total = totalResult[0]?.count || 0;

  // Converted enquiries
  const convertedResult = await db
    .select({ count: count() })
    .from(enquiries)
    .where(eq(enquiries.currentStatus, 'Converted'));
  const converted = convertedResult[0]?.count || 0;

  // This month enquiries
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthResult = await db
    .select({ count: count() })
    .from(enquiries)
    .where(sql`${enquiries.dateOfEnquiry} >= ${startOfMonth.toISOString().split('T')[0]}`);
  const thisMonth = thisMonthResult[0]?.count || 0;

  // Total revenue
  const revenueResult = await db
    .select({ 
      total: sql<number>`COALESCE(SUM(${enquiries.proposalValue}), 0)` 
    })
    .from(enquiries)
    .where(eq(enquiries.currentStatus, 'Converted'));
  const revenue = Number(revenueResult[0]?.total || 0);

  return {
    totalEnquiries: total,
    convertedEnquiries: converted,
    conversionRate: total > 0 ? (converted / total) * 100 : 0,
    thisMonthEnquiries: thisMonth,
    totalRevenue: revenue,
  };
}

/**
 * Get pipeline forecast
 */
export async function getPipelineForecast() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Status probability weights
  const weights: Record<string, number> = {
    'Pending': 0.1,
    'Contacted': 0.2,
    'Meeting Scheduled': 0.4,
    'Proposal Sent': 0.6,
    'Converted': 1.0,
  };

  const result = await db
    .select({
      status: enquiries.currentStatus,
      count: count(),
      totalValue: sql<number>`COALESCE(SUM(${enquiries.proposalValue}), 0)`,
    })
    .from(enquiries)
    .groupBy(enquiries.currentStatus);

  return result.map(row => ({
    status: row.status,
    count: row.count,
    totalValue: Number(row.totalValue),
    probability: weights[row.status || ''] || 0,
    weightedValue: Number(row.totalValue) * (weights[row.status || ''] || 0),
  }));
}
