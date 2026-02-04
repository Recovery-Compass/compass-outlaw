import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal } from "drizzle-orm/mysql-core";

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
 * Subscription tracking table
 */
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  vendor: varchar("vendor", { length: 255 }).notNull(),
  amount: int("amount").notNull(), // Store as cents to avoid decimal issues
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  frequency: mysqlEnum("frequency", ["monthly", "yearly", "quarterly", "weekly"]).default("monthly").notNull(),
  lastChargeDate: timestamp("lastChargeDate"),
  nextChargeDate: timestamp("nextChargeDate"),
  status: mysqlEnum("status", ["active", "pending_cancellation", "cancelled", "paused"]).default("active").notNull(),
  cancellationUrl: text("cancellationUrl"),
  cancellationMethod: mysqlEnum("cancellationMethod", ["portal", "email", "phone", "chat"]),
  notes: text("notes"),
  category: varchar("category", { length: 100 }), // e.g., "SaaS", "Streaming", "Utilities"
  priority: mysqlEnum("priority", ["high", "medium", "low"]).default("medium").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

/**
 * Subscription actions tracking (cancellations, downgrades, refunds)
 */
export const subscriptionActions = mysqlTable("subscriptionActions", {
  id: int("id").autoincrement().primaryKey(),
  subscriptionId: int("subscriptionId").notNull(),
  actionType: mysqlEnum("actionType", ["cancel", "downgrade", "refund_request", "pause"]).notNull(),
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "failed"]).default("pending").notNull(),
  scheduledDate: timestamp("scheduledDate"),
  completedDate: timestamp("completedDate"),
  emailSent: boolean("emailSent").default(false).notNull(),
  emailThreadId: varchar("emailThreadId", { length: 255 }),
  responseReceived: boolean("responseReceived").default(false).notNull(),
  result: text("result"), // Store outcome details
  expectedSavings: int("expectedSavings"), // Monthly savings in cents
  actualSavings: int("actualSavings"), // Actual savings achieved in cents
  refundAmount: int("refundAmount"), // Refund amount in cents
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SubscriptionAction = typeof subscriptionActions.$inferSelect;
export type InsertSubscriptionAction = typeof subscriptionActions.$inferInsert;

/**
 * Recovery pipeline for outstanding payments/refunds
 */
export const recoveryPipeline = mysqlTable("recoveryPipeline", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  debtorName: varchar("debtorName", { length: 255 }).notNull(),
  debtorEmail: varchar("debtorEmail", { length: 320 }),
  debtorCompany: varchar("debtorCompany", { length: 255 }),
  amount: int("amount").notNull(), // Amount in cents
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  invoiceDate: timestamp("invoiceDate"),
  invoiceNumber: varchar("invoiceNumber", { length: 100 }),
  daysOutstanding: int("daysOutstanding").default(0).notNull(),
  status: mysqlEnum("status", ["new", "contacted", "follow_up_1", "follow_up_2", "follow_up_3", "escalated", "resolved", "written_off"]).default("new").notNull(),
  lastContactDate: timestamp("lastContactDate"),
  nextActionDate: timestamp("nextActionDate"),
  confidenceScore: int("confidenceScore").default(50).notNull(), // 0-100
  category: varchar("category", { length: 100 }), // e.g., "invoice", "refund", "legal"
  priority: mysqlEnum("priority", ["urgent", "high", "medium", "low"]).default("medium").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RecoveryItem = typeof recoveryPipeline.$inferSelect;
export type InsertRecoveryItem = typeof recoveryPipeline.$inferInsert;

/**
 * Contact history for recovery pipeline
 */
export const contactHistory = mysqlTable("contactHistory", {
  id: int("id").autoincrement().primaryKey(),
  recoveryId: int("recoveryId").notNull(),
  contactDate: timestamp("contactDate").defaultNow().notNull(),
  method: mysqlEnum("method", ["email", "phone", "formal_notice", "legal"]).notNull(),
  emailThreadId: varchar("emailThreadId", { length: 255 }),
  content: text("content"),
  responseReceived: boolean("responseReceived").default(false).notNull(),
  responseDate: timestamp("responseDate"),
  responseContent: text("responseContent"),
  sentiment: mysqlEnum("sentiment", ["positive", "neutral", "negative", "hostile"]),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ContactHistoryItem = typeof contactHistory.$inferSelect;
export type InsertContactHistoryItem = typeof contactHistory.$inferInsert;

/**
 * Email templates for automation
 */
export const emailTemplates = mysqlTable("emailTemplates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  category: mysqlEnum("category", ["cancellation", "refund", "follow_up", "escalation", "custom"]).notNull(),
  subject: varchar("subject", { length: 500 }).notNull(),
  body: text("body").notNull(),
  variables: text("variables"), // JSON string of available variables
  isDefault: boolean("isDefault").default(false).notNull(),
  usageCount: int("usageCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type InsertEmailTemplate = typeof emailTemplates.$inferInsert;

/**
 * Attorney coalition tracking (for legal context from copilot-execution-directive)
 */
export const attorneys = mysqlTable("attorneys", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  firm: varchar("firm", { length: 255 }),
  email: varchar("email", { length: 320 }).notNull(),
  caseId: varchar("caseId", { length: 100 }),
  caseDescription: text("caseDescription"),
  lastContactDate: timestamp("lastContactDate"),
  engagementLevel: mysqlEnum("engagementLevel", ["highly_engaged", "engaged", "moderately_engaged", "low_engagement"]).default("moderately_engaged").notNull(),
  confidenceScore: int("confidenceScore").default(50).notNull(), // 0-100
  riskZone: mysqlEnum("riskZone", ["green", "yellow", "red"]).default("green").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Attorney = typeof attorneys.$inferSelect;
export type InsertAttorney = typeof attorneys.$inferInsert;

/**
 * Protected tools that should not be cancelled
 */
export const protectedTools = mysqlTable("protectedTools", {
  id: int("id").autoincrement().primaryKey(),
  toolName: varchar("toolName", { length: 255 }).notNull().unique(),
  reason: text("reason"),
  protectedUntil: timestamp("protectedUntil"), // null = protected indefinitely
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProtectedTool = typeof protectedTools.$inferSelect;
export type InsertProtectedTool = typeof protectedTools.$inferInsert;

/**
 * Analytics tracking
 */
export const analytics = mysqlTable("analytics", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  metricType: varchar("metricType", { length: 100 }).notNull(), // e.g., "monthly_savings", "refund_recovered", "revenue_generated"
  value: int("value").notNull(), // Value in cents
  period: varchar("period", { length: 20 }).notNull(), // e.g., "2025-11", "2025-Q4"
  category: varchar("category", { length: 100 }),
  metadata: text("metadata"), // JSON string for additional data
  recordedAt: timestamp("recordedAt").defaultNow().notNull(),
});

export type AnalyticsRecord = typeof analytics.$inferSelect;
export type InsertAnalyticsRecord = typeof analytics.$inferInsert;
