import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("enquiries.create", () => {
  it("creates an enquiry with auto-generated enquiry ID", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.enquiries.create({
      dateOfEnquiry: "2025-01-15",
      clientName: "Test Client " + Date.now(),
      serviceRequested: "Corporate / M&A",
      urgencyLevel: "High",
      currentStatus: "Pending",
    });

    expect(result).toHaveProperty("enquiryId");
    expect(result.enquiryId).toMatch(/^ENQ-\d{4}$/);
    expect(result).toHaveProperty("id");
    expect(typeof result.id).toBe("number");
  });

  it("generates sequential enquiry IDs", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result1 = await caller.enquiries.create({
      dateOfEnquiry: "2025-01-15",
      clientName: "Client One " + Date.now(),
    });

    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    const result2 = await caller.enquiries.create({
      dateOfEnquiry: "2025-01-16",
      clientName: "Client Two " + Date.now(),
    });

    const id1Num = parseInt(result1.enquiryId.split("-")[1] || "0");
    const id2Num = parseInt(result2.enquiryId.split("-")[1] || "0");

    expect(id2Num).toBeGreaterThan(id1Num);
  });
});

describe("enquiries.update", () => {
  it("auto-generates matter code when conversion date is set", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const created = await caller.enquiries.create({
      dateOfEnquiry: "2025-01-15",
      clientName: "Test Client " + Date.now(),
      currentStatus: "Pending",
    });

    const updated = await caller.enquiries.update({
      id: created.id,
      conversionDate: "2025-01-20",
      currentStatus: "Converted",
    });

    expect(updated).toHaveProperty("matterCode");
    expect(updated?.matterCode).toMatch(/^MAT-\d{4}-\d{3}$/);
  });

  it("updates enquiry fields correctly", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const created = await caller.enquiries.create({
      dateOfEnquiry: "2025-01-15",
      clientName: "Original Name " + Date.now(),
      currentStatus: "Pending",
    });

    const updated = await caller.enquiries.update({
      id: created.id,
      clientName: "Updated Name",
      currentStatus: "Contacted",
      urgencyLevel: "Critical",
    });

    expect(updated?.clientName).toBe("Updated Name");
    expect(updated?.currentStatus).toBe("Contacted");
    expect(updated?.urgencyLevel).toBe("Critical");
  });
});

describe("enquiries.list", () => {
  it("returns all enquiries", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await caller.enquiries.create({
      dateOfEnquiry: "2025-01-15",
      clientName: "Client A " + Date.now(),
    });

    await new Promise(resolve => setTimeout(resolve, 10));

    await caller.enquiries.create({
      dateOfEnquiry: "2025-01-16",
      clientName: "Client B " + Date.now(),
    });

    const list = await caller.enquiries.list();

    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThanOrEqual(2);
  });
});

describe("enquiries.get", () => {
  it("retrieves a specific enquiry by ID", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const created = await caller.enquiries.create({
      dateOfEnquiry: "2025-01-15",
      clientName: "Specific Client " + Date.now(),
      email: "specific" + Date.now() + "@example.com",
    });

    const retrieved = await caller.enquiries.get({ id: created.id });

    expect(retrieved).not.toBeNull();
    expect(retrieved?.clientName).toBe("Specific Client");
    expect(retrieved?.email).toBe("specific@example.com");
    expect(retrieved?.enquiryId).toBe(created.enquiryId);
  });
});

describe("enquiries.statusSummary", () => {
  it("returns status distribution", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const summary = await caller.enquiries.statusSummary();

    expect(Array.isArray(summary)).toBe(true);
    summary.forEach(item => {
      expect(item).toHaveProperty("status");
      expect(item).toHaveProperty("count");
      expect(typeof item.count).toBe("number");
    });
  });
});

describe("enquiries.kpiMetrics", () => {
  it("returns KPI metrics with correct structure", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const metrics = await caller.enquiries.kpiMetrics();

    expect(metrics).toHaveProperty("totalEnquiries");
    expect(metrics).toHaveProperty("convertedEnquiries");
    expect(metrics).toHaveProperty("conversionRate");
    expect(metrics).toHaveProperty("thisMonthEnquiries");
    expect(metrics).toHaveProperty("totalRevenue");

    expect(typeof metrics.totalEnquiries).toBe("number");
    expect(typeof metrics.conversionRate).toBe("number");
    expect(metrics.conversionRate).toBeGreaterThanOrEqual(0);
    expect(metrics.conversionRate).toBeLessThanOrEqual(100);
  });
});

describe("enquiries.pipelineForecast", () => {
  it("returns pipeline forecast with probability weights", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const forecast = await caller.enquiries.pipelineForecast();

    expect(Array.isArray(forecast)).toBe(true);
    forecast.forEach(item => {
      expect(item).toHaveProperty("status");
      expect(item).toHaveProperty("count");
      expect(item).toHaveProperty("totalValue");
      expect(item).toHaveProperty("probability");
      expect(item).toHaveProperty("weightedValue");
      expect(item.probability).toBeGreaterThanOrEqual(0);
      expect(item.probability).toBeLessThanOrEqual(1);
    });
  });
});
