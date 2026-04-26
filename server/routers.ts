import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure, adminProcedure } from "./_core/trpc";
import { AUTH_COOKIE, createSessionToken, verifyPassword, hashPassword, isSecureRequest } from "./_core/auth";
import { z } from "zod";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,

  // ─── Auth ─────────────────────────────────────────────────────────────────

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),

    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        const user = await db.getUserByEmail(input.email);
        if (!user || !user.passwordHash) {
          throw new Error("Invalid email or password");
        }
        if (user.status !== "active") {
          throw new Error("Account is not active");
        }
        const valid = await verifyPassword(input.password, user.passwordHash);
        if (!valid) {
          throw new Error("Invalid email or password");
        }

        await db.updateLastLogin(user.id);
        const token = await createSessionToken(user.id, user.email);

        ctx.res.cookie(AUTH_COOKIE, token, {
          httpOnly: true,
          path: "/",
          sameSite: "lax",
          secure: isSecureRequest(ctx.req),
          maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });

        const { passwordHash: _ph, ...safeUser } = user;
        return { success: true, user: safeUser };
      }),

    logout: publicProcedure.mutation(({ ctx }) => {
      ctx.res.clearCookie(AUTH_COOKIE, { path: "/" });
      return { success: true };
    }),
  }),

  // ─── Dashboard ────────────────────────────────────────────────────────────

  dashboard: router({
    stats: protectedProcedure.query(async () => {
      return db.getDashboardStats();
    }),

    recentActivity: protectedProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ input }) => {
        return db.getRecentActivity(input.limit ?? 20);
      }),
  }),

  // ─── Leads ────────────────────────────────────────────────────────────────

  leads: router({
    list: protectedProcedure.query(async () => db.getAllLeads()),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => db.getLeadById(input.id)),

    create: protectedProcedure
      .input(z.object({
        dateOfEnquiry: z.string(),
        clientName: z.string().min(1),
        time: z.string().optional(),
        communicationChannel: z.string().optional(),
        receivedBy: z.string().optional(),
        clientType: z.string().optional(),
        nationality: z.string().optional(),
        email: z.string().email().optional().or(z.literal("")),
        phoneNumber: z.string().optional(),
        preferredContactMethod: z.string().optional(),
        languagePreference: z.string().optional(),
        companyId: z.number().optional(),
        serviceRequested: z.string().optional(),
        shortDescription: z.string().optional(),
        urgencyLevel: z.string().optional(),
        clientBudget: z.string().optional(),
        potentialValueRange: z.string().optional(),
        expectedTimeline: z.string().optional(),
        referralSourceName: z.string().optional(),
        competitorInvolvement: z.string().optional(),
        competitorName: z.string().optional(),
        assignedDepartment: z.string().optional(),
        assignedTo: z.number().optional(),
        suggestedLeadLawyer: z.string().optional(),
        currentStatus: z.string().optional(),
        nextAction: z.string().optional(),
        deadline: z.string().optional(),
        internalNotes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return db.createLead(input, ctx.user.id);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        dateOfEnquiry: z.string().optional(),
        clientName: z.string().optional(),
        time: z.string().optional(),
        communicationChannel: z.string().optional(),
        receivedBy: z.string().optional(),
        clientType: z.string().optional(),
        nationality: z.string().optional(),
        email: z.string().optional(),
        phoneNumber: z.string().optional(),
        preferredContactMethod: z.string().optional(),
        languagePreference: z.string().optional(),
        companyId: z.number().optional(),
        serviceRequested: z.string().optional(),
        shortDescription: z.string().optional(),
        urgencyLevel: z.string().optional(),
        clientBudget: z.string().optional(),
        potentialValueRange: z.string().optional(),
        expectedTimeline: z.string().optional(),
        referralSourceName: z.string().optional(),
        competitorInvolvement: z.string().optional(),
        competitorName: z.string().optional(),
        assignedDepartment: z.string().optional(),
        assignedTo: z.number().optional(),
        suggestedLeadLawyer: z.string().optional(),
        currentStatus: z.string().optional(),
        nextAction: z.string().optional(),
        deadline: z.string().optional(),
        firstResponseDate: z.string().optional(),
        meetingDate: z.string().optional(),
        proposalSentDate: z.string().optional(),
        proposalValue: z.string().optional(),
        followUpCount: z.number().optional(),
        lastContactDate: z.string().optional(),
        conversionDate: z.string().optional(),
        engagementLetterDate: z.string().optional(),
        matterCode: z.string().optional(),
        paymentStatus: z.string().optional(),
        invoiceNumber: z.string().optional(),
        lostReason: z.string().optional(),
        internalNotes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateLead(id, data);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteLead(input.id);
        return { success: true };
      }),

    statusSummary: protectedProcedure.query(async () => db.getLeadStatusSummary()),
    kpiMetrics: protectedProcedure.query(async () => db.getLeadKpiMetrics()),
    pipelineForecast: protectedProcedure.query(async () => db.getPipelineForecast()),
  }),

  // ─── Matters ──────────────────────────────────────────────────────────────

  matters: router({
    list: protectedProcedure.query(async () => db.getAllMatters()),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => db.getMatterById(input.id)),

    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        clientName: z.string().min(1),
        clientEmail: z.string().email().optional().or(z.literal("")),
        clientPhone: z.string().optional(),
        companyId: z.number().optional(),
        leadId: z.number().optional(),
        practiceArea: z.string().optional(),
        status: z.string().optional(),
        priority: z.string().optional(),
        assignedTo: z.number().optional(),
        openDate: z.string().optional(),
        estimatedValue: z.string().optional(),
        billingType: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return db.createMatter(input, ctx.user.id);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        clientName: z.string().optional(),
        clientEmail: z.string().optional(),
        clientPhone: z.string().optional(),
        companyId: z.number().optional(),
        practiceArea: z.string().optional(),
        status: z.string().optional(),
        priority: z.string().optional(),
        assignedTo: z.number().optional(),
        openDate: z.string().optional(),
        closeDate: z.string().optional(),
        nextHearingDate: z.string().optional(),
        estimatedValue: z.string().optional(),
        actualValue: z.string().optional(),
        billingType: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateMatter(id, data);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteMatter(input.id);
        return { success: true };
      }),
  }),

  // ─── Tasks ────────────────────────────────────────────────────────────────

  tasks: router({
    list: protectedProcedure
      .input(z.object({
        matterId: z.number().optional(),
        assignedTo: z.number().optional(),
        status: z.string().optional(),
      }).optional())
      .query(async ({ input }) => db.getAllTasks(input ?? {})),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => db.getTaskById(input.id)),

    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        status: z.string().optional(),
        priority: z.string().optional(),
        matterId: z.number().optional(),
        leadId: z.number().optional(),
        assignedTo: z.number().optional(),
        dueDate: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return db.createTask(input, ctx.user.id);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        status: z.string().optional(),
        priority: z.string().optional(),
        matterId: z.number().optional(),
        assignedTo: z.number().optional(),
        dueDate: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateTask(id, data);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteTask(input.id);
        return { success: true };
      }),
  }),

  // ─── Notes ────────────────────────────────────────────────────────────────

  notes: router({
    byEntity: protectedProcedure
      .input(z.object({ entityType: z.string(), entityId: z.number() }))
      .query(async ({ input }) => db.getNotesByEntity(input.entityType, input.entityId)),

    create: protectedProcedure
      .input(z.object({
        content: z.string().min(1),
        entityType: z.string(),
        entityId: z.number(),
        matterId: z.number().optional(),
        leadId: z.number().optional(),
        isPrivate: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return db.createNote({ ...input, createdBy: ctx.user.id });
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteNote(input.id);
        return { success: true };
      }),
  }),

  // ─── Payments ─────────────────────────────────────────────────────────────

  payments: router({
    list: protectedProcedure.query(async () => db.getAllPayments()),

    getByLead: protectedProcedure
      .input(z.object({ leadId: z.number() }))
      .query(async ({ input }) => db.getPaymentByLeadId(input.leadId)),

    create: protectedProcedure
      .input(z.object({
        leadId: z.number(),
        matterCode: z.string(),
        paymentTerms: z.string().optional(),
        paymentStatus: z.string().optional(),
        totalAmount: z.string().optional(),
        amountPaid: z.string().optional(),
        amountOutstanding: z.string().optional(),
        retainerPaidDate: z.string().optional(),
        retainerAmount: z.string().optional(),
        midPaymentDate: z.string().optional(),
        midPaymentAmount: z.string().optional(),
        finalPaymentDate: z.string().optional(),
        finalPaymentAmount: z.string().optional(),
        paymentNotes: z.string().optional(),
      }))
      .mutation(async ({ input }) => db.createPayment(input)),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        paymentTerms: z.string().optional(),
        paymentStatus: z.string().optional(),
        totalAmount: z.string().optional(),
        amountPaid: z.string().optional(),
        amountOutstanding: z.string().optional(),
        retainerPaidDate: z.string().optional(),
        retainerAmount: z.string().optional(),
        midPaymentDate: z.string().optional(),
        midPaymentAmount: z.string().optional(),
        finalPaymentDate: z.string().optional(),
        finalPaymentAmount: z.string().optional(),
        paymentNotes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updatePayment(id, data);
      }),
  }),

  // ─── Companies ────────────────────────────────────────────────────────────

  companies: router({
    list: protectedProcedure.query(async () => db.getAllCompanies()),

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        industry: z.string().optional(),
        website: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional().or(z.literal("")),
        address: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return db.createCompany({ ...input, createdBy: ctx.user.id });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        industry: z.string().optional(),
        website: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        address: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateCompany(id, data);
      }),
  }),

  // ─── Users ────────────────────────────────────────────────────────────────

  users: router({
    list: protectedProcedure.query(async () => {
      const all = await db.getAllUsers();
      return all.map(({ passwordHash: _ph, ...u }) => u);
    }),

    updateRole: adminProcedure
      .input(z.object({ userId: z.number(), role: z.enum(["user", "admin", "viewer"]) }))
      .mutation(async ({ input }) => {
        await db.updateUserRole(input.userId, input.role);
        return { success: true };
      }),

    updateStatus: adminProcedure
      .input(z.object({ userId: z.number(), status: z.enum(["active", "inactive", "suspended"]) }))
      .mutation(async ({ input }) => {
        await db.updateUserStatus(input.userId, input.status);
        return { success: true };
      }),

    updatePassword: protectedProcedure
      .input(z.object({ currentPassword: z.string(), newPassword: z.string().min(8) }))
      .mutation(async ({ input, ctx }) => {
        const user = await db.getUserById(ctx.user.id);
        if (!user?.passwordHash) throw new Error("No password set");
        const valid = await verifyPassword(input.currentPassword, user.passwordHash);
        if (!valid) throw new Error("Current password is incorrect");
        const hash = await hashPassword(input.newPassword);
        await db.updateUser(ctx.user.id, { passwordHash: hash });
        return { success: true };
      }),

    activityStats: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => db.getUserActivityStats(input.userId)),
  }),

  // ─── Audit Logs ───────────────────────────────────────────────────────────

  auditLogs: router({
    byEntity: protectedProcedure
      .input(z.object({ entityType: z.string(), entityId: z.number() }))
      .query(async ({ input }) => {
        return db.getAuditLogsByEntity(input.entityType, input.entityId);
      }),
  }),

  // ─── Contact / Chat Submissions ───────────────────────────────────────────

  chat: router({
    list: protectedProcedure.query(async () => db.getAllChatSubmissions()),

    submit: publicProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().email().optional().or(z.literal("")),
        phone: z.string().optional(),
        subject: z.string().optional(),
        message: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        return db.createChatSubmission(input);
      }),

    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["new", "read", "replied", "converted"]),
      }))
      .mutation(async ({ input }) => {
        await db.updateChatSubmissionStatus(input.id, input.status);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
