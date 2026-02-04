import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Dashboard summary
  dashboard: router({
    summary: protectedProcedure.query(async ({ ctx }) => {
      return await db.getDashboardSummary(ctx.user.id);
    }),
  }),

  // Subscription management
  subscriptions: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserSubscriptions(ctx.user.id);
    }),

    active: protectedProcedure.query(async ({ ctx }) => {
      return await db.getActiveSubscriptions(ctx.user.id);
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getSubscriptionById(input.id);
      }),

    create: protectedProcedure
      .input(z.object({
        vendor: z.string(),
        amount: z.number(), // in cents
        currency: z.string().default("USD"),
        frequency: z.enum(["monthly", "yearly", "quarterly", "weekly"]).default("monthly"),
        lastChargeDate: z.date().optional(),
        nextChargeDate: z.date().optional(),
        cancellationUrl: z.string().optional(),
        cancellationMethod: z.enum(["portal", "email", "phone", "chat"]).optional(),
        notes: z.string().optional(),
        category: z.string().optional(),
        priority: z.enum(["high", "medium", "low"]).default("medium"),
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.createSubscription({
          ...input,
          userId: ctx.user.id,
          status: "active",
        });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        vendor: z.string().optional(),
        amount: z.number().optional(),
        frequency: z.enum(["monthly", "yearly", "quarterly", "weekly"]).optional(),
        status: z.enum(["active", "pending_cancellation", "cancelled", "paused"]).optional(),
        cancellationUrl: z.string().optional(),
        cancellationMethod: z.enum(["portal", "email", "phone", "chat"]).optional(),
        notes: z.string().optional(),
        category: z.string().optional(),
        priority: z.enum(["high", "medium", "low"]).optional(),
        lastChargeDate: z.date().optional(),
        nextChargeDate: z.date().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await db.updateSubscription(id, updates);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteSubscription(input.id);
        return { success: true };
      }),
  }),

  // Subscription actions (cancellations, refunds, downgrades)
  actions: router({
    list: protectedProcedure
      .input(z.object({ subscriptionId: z.number() }))
      .query(async ({ input }) => {
        return await db.getSubscriptionActions(input.subscriptionId);
      }),

    pending: protectedProcedure.query(async () => {
      return await db.getPendingActions();
    }),

    create: protectedProcedure
      .input(z.object({
        subscriptionId: z.number(),
        actionType: z.enum(["cancel", "downgrade", "refund_request", "pause"]),
        scheduledDate: z.date().optional(),
        expectedSavings: z.number().optional(),
        refundAmount: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createSubscriptionAction({
          ...input,
          status: "pending",
        });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "in_progress", "completed", "failed"]).optional(),
        completedDate: z.date().optional(),
        emailSent: z.boolean().optional(),
        emailThreadId: z.string().optional(),
        responseReceived: z.boolean().optional(),
        result: z.string().optional(),
        actualSavings: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await db.updateSubscriptionAction(id, updates);
        return { success: true };
      }),
  }),

  // Recovery pipeline
  recovery: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserRecoveryItems(ctx.user.id);
    }),

    active: protectedProcedure.query(async ({ ctx }) => {
      return await db.getActiveRecoveryItems(ctx.user.id);
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getRecoveryItemById(input.id);
      }),

    create: protectedProcedure
      .input(z.object({
        debtorName: z.string(),
        debtorEmail: z.string().optional(),
        debtorCompany: z.string().optional(),
        amount: z.number(), // in cents
        currency: z.string().default("USD"),
        invoiceDate: z.date().optional(),
        invoiceNumber: z.string().optional(),
        category: z.string().optional(),
        priority: z.enum(["urgent", "high", "medium", "low"]).default("medium"),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.createRecoveryItem({
          ...input,
          userId: ctx.user.id,
          status: "new",
          daysOutstanding: 0,
          confidenceScore: 50,
        });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["new", "contacted", "follow_up_1", "follow_up_2", "follow_up_3", "escalated", "resolved", "written_off"]).optional(),
        lastContactDate: z.date().optional(),
        nextActionDate: z.date().optional(),
        confidenceScore: z.number().optional(),
        priority: z.enum(["urgent", "high", "medium", "low"]).optional(),
        notes: z.string().optional(),
        daysOutstanding: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await db.updateRecoveryItem(id, updates);
        return { success: true };
      }),

    // Get contact history for a recovery item
    contactHistory: protectedProcedure
      .input(z.object({ recoveryId: z.number() }))
      .query(async ({ input }) => {
        return await db.getContactHistory(input.recoveryId);
      }),

    // Add contact to history
    addContact: protectedProcedure
      .input(z.object({
        recoveryId: z.number(),
        method: z.enum(["email", "phone", "formal_notice", "legal"]),
        emailThreadId: z.string().optional(),
        content: z.string().optional(),
        responseReceived: z.boolean().default(false),
        responseDate: z.date().optional(),
        responseContent: z.string().optional(),
        sentiment: z.enum(["positive", "neutral", "negative", "hostile"]).optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createContactHistory(input);
      }),
  }),

  // Email templates
  templates: router({
    list: protectedProcedure
      .input(z.object({ category: z.string().optional() }))
      .query(async ({ ctx, input }) => {
        return await db.getUserEmailTemplates(ctx.user.id, input.category);
      }),

    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        category: z.enum(["cancellation", "refund", "follow_up", "escalation", "custom"]),
        subject: z.string(),
        body: z.string(),
        variables: z.string().optional(),
        isDefault: z.boolean().default(false),
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.createEmailTemplate({
          ...input,
          userId: ctx.user.id,
          usageCount: 0,
        });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        subject: z.string().optional(),
        body: z.string().optional(),
        variables: z.string().optional(),
        isDefault: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await db.updateEmailTemplate(id, updates);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteEmailTemplate(input.id);
        return { success: true };
      }),
  }),

  // Attorney coalition tracking
  attorneys: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserAttorneys(ctx.user.id);
    }),

    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        firm: z.string().optional(),
        email: z.string(),
        caseId: z.string().optional(),
        caseDescription: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.createAttorney({
          ...input,
          userId: ctx.user.id,
          engagementLevel: "moderately_engaged",
          confidenceScore: 50,
          riskZone: "green",
        });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        lastContactDate: z.date().optional(),
        engagementLevel: z.enum(["highly_engaged", "engaged", "moderately_engaged", "low_engagement"]).optional(),
        confidenceScore: z.number().optional(),
        riskZone: z.enum(["green", "yellow", "red"]).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await db.updateAttorney(id, updates);
        return { success: true };
      }),
  }),

  // Analytics
  analytics: router({
    records: protectedProcedure
      .input(z.object({
        metricType: z.string().optional(),
        period: z.string().optional(),
      }))
      .query(async ({ ctx, input }) => {
        return await db.getUserAnalytics(ctx.user.id, input.metricType, input.period);
      }),

    create: protectedProcedure
      .input(z.object({
        metricType: z.string(),
        value: z.number(), // in cents
        period: z.string(),
        category: z.string().optional(),
        metadata: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.createAnalyticsRecord({
          ...input,
          userId: ctx.user.id,
        });
      }),
  }),
});

export type AppRouter = typeof appRouter;
