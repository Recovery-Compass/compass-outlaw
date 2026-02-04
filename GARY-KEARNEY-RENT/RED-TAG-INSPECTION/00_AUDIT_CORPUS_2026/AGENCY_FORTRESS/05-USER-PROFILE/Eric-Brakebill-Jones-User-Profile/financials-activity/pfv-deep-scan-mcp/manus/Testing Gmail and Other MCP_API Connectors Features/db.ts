import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  subscriptions, 
  InsertSubscription,
  Subscription,
  subscriptionActions,
  InsertSubscriptionAction,
  SubscriptionAction,
  recoveryPipeline,
  InsertRecoveryItem,
  RecoveryItem,
  contactHistory,
  InsertContactHistoryItem,
  ContactHistoryItem,
  emailTemplates,
  InsertEmailTemplate,
  EmailTemplate,
  attorneys,
  InsertAttorney,
  Attorney,
  analytics,
  InsertAnalyticsRecord,
  AnalyticsRecord
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

// ============ User Functions ============

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

// ============ Subscription Functions ============

export async function createSubscription(subscription: InsertSubscription): Promise<Subscription> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(subscriptions).values(subscription);
  const insertId = (result as any).insertId;
  const [created] = await db.select().from(subscriptions).where(eq(subscriptions.id, Number(insertId)));
  return created;
}

export async function getUserSubscriptions(userId: number): Promise<Subscription[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .orderBy(desc(subscriptions.amount));
}

export async function getActiveSubscriptions(userId: number): Promise<Subscription[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(subscriptions)
    .where(and(
      eq(subscriptions.userId, userId),
      eq(subscriptions.status, 'active')
    ))
    .orderBy(desc(subscriptions.amount));
}

export async function updateSubscription(id: number, updates: Partial<Subscription>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(subscriptions)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(subscriptions.id, id));
}

export async function deleteSubscription(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(subscriptions).where(eq(subscriptions.id, id));
}

export async function getSubscriptionById(id: number): Promise<Subscription | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const [result] = await db.select().from(subscriptions).where(eq(subscriptions.id, id)).limit(1);
  return result;
}

// ============ Subscription Action Functions ============

export async function createSubscriptionAction(action: InsertSubscriptionAction): Promise<SubscriptionAction> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(subscriptionActions).values(action);
  const insertId = (result as any).insertId;
  const [created] = await db.select().from(subscriptionActions).where(eq(subscriptionActions.id, Number(insertId)));
  return created;
}

export async function getSubscriptionActions(subscriptionId: number): Promise<SubscriptionAction[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(subscriptionActions)
    .where(eq(subscriptionActions.subscriptionId, subscriptionId))
    .orderBy(desc(subscriptionActions.createdAt));
}

export async function getPendingActions(): Promise<SubscriptionAction[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(subscriptionActions)
    .where(eq(subscriptionActions.status, 'pending'))
    .orderBy(subscriptionActions.scheduledDate);
}

export async function updateSubscriptionAction(id: number, updates: Partial<SubscriptionAction>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(subscriptionActions)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(subscriptionActions.id, id));
}

// ============ Recovery Pipeline Functions ============

export async function createRecoveryItem(item: InsertRecoveryItem): Promise<RecoveryItem> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(recoveryPipeline).values(item);
  const insertId = (result as any).insertId;
  const [created] = await db.select().from(recoveryPipeline).where(eq(recoveryPipeline.id, Number(insertId)));
  return created;
}

export async function getUserRecoveryItems(userId: number): Promise<RecoveryItem[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(recoveryPipeline)
    .where(eq(recoveryPipeline.userId, userId))
    .orderBy(desc(recoveryPipeline.priority), desc(recoveryPipeline.amount));
}

export async function getActiveRecoveryItems(userId: number): Promise<RecoveryItem[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(recoveryPipeline)
    .where(and(
      eq(recoveryPipeline.userId, userId),
      sql`${recoveryPipeline.status} NOT IN ('resolved', 'written_off')`
    ))
    .orderBy(desc(recoveryPipeline.nextActionDate));
}

export async function updateRecoveryItem(id: number, updates: Partial<RecoveryItem>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(recoveryPipeline)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(recoveryPipeline.id, id));
}

export async function getRecoveryItemById(id: number): Promise<RecoveryItem | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const [result] = await db.select().from(recoveryPipeline).where(eq(recoveryPipeline.id, id)).limit(1);
  return result;
}

// ============ Contact History Functions ============

export async function createContactHistory(contact: InsertContactHistoryItem): Promise<ContactHistoryItem> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(contactHistory).values(contact);
  const insertId = (result as any).insertId;
  const [created] = await db.select().from(contactHistory).where(eq(contactHistory.id, Number(insertId)));
  return created;
}

export async function getContactHistory(recoveryId: number): Promise<ContactHistoryItem[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(contactHistory)
    .where(eq(contactHistory.recoveryId, recoveryId))
    .orderBy(desc(contactHistory.contactDate));
}

// ============ Email Template Functions ============

export async function createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(emailTemplates).values(template);
  const insertId = (result as any).insertId;
  const [created] = await db.select().from(emailTemplates).where(eq(emailTemplates.id, Number(insertId)));
  return created;
}

export async function getUserEmailTemplates(userId: number, category?: string): Promise<EmailTemplate[]> {
  const db = await getDb();
  if (!db) return [];

  if (category) {
    return await db.select().from(emailTemplates)
      .where(and(
        eq(emailTemplates.userId, userId),
        eq(emailTemplates.category, category as any)
      ))
      .orderBy(desc(emailTemplates.isDefault), desc(emailTemplates.usageCount));
  }

  return await db.select().from(emailTemplates)
    .where(eq(emailTemplates.userId, userId))
    .orderBy(desc(emailTemplates.isDefault), desc(emailTemplates.usageCount));
}

export async function updateEmailTemplate(id: number, updates: Partial<EmailTemplate>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(emailTemplates)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(emailTemplates.id, id));
}

export async function deleteEmailTemplate(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(emailTemplates).where(eq(emailTemplates.id, id));
}

// ============ Attorney Functions ============

export async function createAttorney(attorney: InsertAttorney): Promise<Attorney> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(attorneys).values(attorney);
  const insertId = (result as any).insertId;
  const [created] = await db.select().from(attorneys).where(eq(attorneys.id, Number(insertId)));
  return created;
}

export async function getUserAttorneys(userId: number): Promise<Attorney[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(attorneys)
    .where(eq(attorneys.userId, userId))
    .orderBy(desc(attorneys.confidenceScore));
}

export async function updateAttorney(id: number, updates: Partial<Attorney>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(attorneys)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(attorneys.id, id));
}

// ============ Analytics Functions ============

export async function createAnalyticsRecord(record: InsertAnalyticsRecord): Promise<AnalyticsRecord> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(analytics).values(record);
  const insertId = (result as any).insertId;
  const [created] = await db.select().from(analytics).where(eq(analytics.id, Number(insertId)));
  return created;
}

export async function getUserAnalytics(userId: number, metricType?: string, period?: string): Promise<AnalyticsRecord[]> {
  const db = await getDb();
  if (!db) return [];

  let conditions = [eq(analytics.userId, userId)];
  
  if (metricType) {
    conditions.push(eq(analytics.metricType, metricType));
  }
  
  if (period) {
    conditions.push(eq(analytics.period, period));
  }

  return await db.select().from(analytics)
    .where(and(...conditions))
    .orderBy(desc(analytics.recordedAt));
}

// ============ Dashboard Summary Functions ============

export async function getDashboardSummary(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const activeSubscriptionsData = await getActiveSubscriptions(userId);
  const totalMonthlySpend = activeSubscriptionsData.reduce((sum, sub) => sum + sub.amount, 0);
  
  const pendingActionsData = await getPendingActions();
  const userPendingActions = pendingActionsData.filter(action => {
    // We need to check if the action belongs to user's subscription
    // This is a simplified version - in production you'd do a JOIN
    return true; // TODO: Add proper filtering
  });
  
  const potentialSavings = userPendingActions.reduce((sum, action) => sum + (action.expectedSavings || 0), 0);
  
  const activeRecoveryData = await getActiveRecoveryItems(userId);
  const totalRecoveryAmount = activeRecoveryData.reduce((sum, item) => sum + item.amount, 0);

  return {
    totalMonthlySpend,
    activeSubscriptionsCount: activeSubscriptionsData.length,
    potentialMonthlySavings: potentialSavings,
    pendingActionsCount: userPendingActions.length,
    activeRecoveryCount: activeRecoveryData.length,
    totalRecoveryAmount,
  };
}
