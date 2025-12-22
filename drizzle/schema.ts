import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, date } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Enquiries table - tracks all client enquiries from initial contact to conversion
 */
export const enquiries = mysqlTable("enquiries", {
  id: int("id").autoincrement().primaryKey(),
  enquiryId: varchar("enquiryId", { length: 20 }).notNull().unique(), // ENQ-0001
  
  // Basic enquiry info
  dateOfEnquiry: date("dateOfEnquiry").notNull(),
  time: varchar("time", { length: 10 }),
  communicationChannel: varchar("communicationChannel", { length: 50 }),
  receivedBy: varchar("receivedBy", { length: 100 }),
  
  // Client details
  clientName: varchar("clientName", { length: 255 }).notNull(),
  clientType: varchar("clientType", { length: 50 }),
  nationality: varchar("nationality", { length: 100 }),
  email: varchar("email", { length: 320 }),
  phoneNumber: varchar("phoneNumber", { length: 50 }),
  preferredContactMethod: varchar("preferredContactMethod", { length: 50 }),
  languagePreference: varchar("languagePreference", { length: 50 }),
  
  // Service details
  serviceRequested: varchar("serviceRequested", { length: 255 }),
  shortDescription: text("shortDescription"),
  urgencyLevel: varchar("urgencyLevel", { length: 20 }),
  clientBudget: decimal("clientBudget", { precision: 15, scale: 2 }),
  potentialValueRange: varchar("potentialValueRange", { length: 50 }),
  expectedTimeline: varchar("expectedTimeline", { length: 100 }),
  
  // Referral and competition
  referralSourceName: varchar("referralSourceName", { length: 255 }),
  competitorInvolvement: varchar("competitorInvolvement", { length: 20 }),
  competitorName: varchar("competitorName", { length: 255 }),
  
  // Assignment
  assignedDepartment: varchar("assignedDepartment", { length: 100 }),
  suggestedLeadLawyer: varchar("suggestedLeadLawyer", { length: 100 }),
  
  // Status tracking
  currentStatus: varchar("currentStatus", { length: 50 }).notNull().default("Pending"),
  nextAction: text("nextAction"),
  deadline: date("deadline"),
  
  // Response tracking
  firstResponseDate: date("firstResponseDate"),
  firstResponseTimeHours: decimal("firstResponseTimeHours", { precision: 10, scale: 2 }),
  meetingDate: date("meetingDate"),
  proposalSentDate: date("proposalSentDate"),
  proposalValue: decimal("proposalValue", { precision: 15, scale: 2 }),
  followUpCount: int("followUpCount").default(0),
  lastContactDate: date("lastContactDate"),
  
  // Conversion
  conversionDate: date("conversionDate"),
  engagementLetterDate: date("engagementLetterDate"),
  matterCode: varchar("matterCode", { length: 20 }), // MAT-2025-001
  
  // Payment
  paymentStatus: varchar("paymentStatus", { length: 50 }),
  invoiceNumber: varchar("invoiceNumber", { length: 100 }),
  
  // Loss tracking
  lostReason: text("lostReason"),
  
  // Notes
  internalNotes: text("internalNotes"),
  
  // Metadata
  createdBy: int("createdBy").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Enquiry = typeof enquiries.$inferSelect;
export type InsertEnquiry = typeof enquiries.$inferInsert;

/**
 * Payments table - tracks payment details for converted enquiries
 */
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  enquiryId: int("enquiryId").notNull().references(() => enquiries.id),
  matterCode: varchar("matterCode", { length: 20 }).notNull(),
  
  // Payment terms
  paymentTerms: text("paymentTerms"),
  
  // Payment details
  paymentStatus: varchar("paymentStatus", { length: 50 }).notNull().default("Not Started"),
  totalAmount: decimal("totalAmount", { precision: 15, scale: 2 }),
  amountPaid: decimal("amountPaid", { precision: 15, scale: 2 }).default("0"),
  amountOutstanding: decimal("amountOutstanding", { precision: 15, scale: 2 }),
  
  // Payment milestones
  retainerPaidDate: date("retainerPaidDate"),
  retainerAmount: decimal("retainerAmount", { precision: 15, scale: 2 }),
  midPaymentDate: date("midPaymentDate"),
  midPaymentAmount: decimal("midPaymentAmount", { precision: 15, scale: 2 }),
  finalPaymentDate: date("finalPaymentDate"),
  finalPaymentAmount: decimal("finalPaymentAmount", { precision: 15, scale: 2 }),
  
  // Notes
  paymentNotes: text("paymentNotes"),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;
