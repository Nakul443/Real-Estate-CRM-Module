import app from "../src/index.js";
import { prisma } from "../src/utils/prisma.js";
import request from "supertest";
import bcrypt from "bcryptjs";

/**
 * BUGS FIXED vs original test file:
 *
 * 1. Test 4 — PATCH → PUT:
 *    leadRoutes.ts only registers `router.put('/:id', ...)`.
 *    There is NO `router.patch('/:id', ...)` for leads, so PATCH returns 404.
 *    Fix: changed `.patch(...)` → `.put(...)` in test 4.
 *
 * 2. Test 3 — RBAC delete guard:
 *    authorize(['ADMIN','AGENT']) lets any agent hit deleteLead, but the
 *    controller then checks `lead.agentId !== userId` and returns 403 if
 *    the lead belongs to a different agent. This coincidentally makes the
 *    test pass, but the assertion comment is misleading — it's an ownership
 *    guard, not a role guard. Added a clear comment so this is obvious.
 *
 * 3. Test 5 — Property `status` field ignored by createProperty:
 *    The controller doesn't destructure `status` from req.body, so the DB
 *    always defaults to AVAILABLE (from the schema). Removed `status` from
 *    the request body since it has no effect, making the test intent clear.
 *
 * 4. Test 7 — Commission `typeof` assertion:
 *    `typeof Number(x)` is ALWAYS "number" even for NaN, making the assertion
 *    meaningless. Fixed to assert the parsed value is a finite number.
 *
 * 5. Test 9 — Dashboard role:
 *    Route uses authorize(['ADMIN','MANAGER']). adminToken has role ADMIN so
 *    this works, but the test was asserting on res.body directly without
 *    checking the status code first. Added status assertion.
 *
 * 6. afterAll — cleanup order:
 *    dealController's deleteProperty uses a transaction that nullifies propertyId
 *    on deals before deleting, but our afterAll was already doing that manually.
 *    Kept explicit cleanup but added the client cleanup that was missing.
 */

describe("Real Estate CRM Integrated Test Suite", () => {
  let adminToken: string;
  let agentToken: string;
  let leadId: string;
  let testClientId: string;
  let testPropertyId: string;
  let testDealId: string;

  // ─── SETUP ────────────────────────────────────────────────────────────────

  beforeAll(async () => {
    const hashedPassword = await bcrypt.hash("password123", 10);

    await prisma.user.upsert({
      where: { email: "admin@recrm.com" },
      update: {},
      create: {
        email: "admin@recrm.com",
        password: hashedPassword,
        name: "Admin Tester",
        role: "ADMIN",
      },
    });

    await prisma.user.upsert({
      where: { email: "agent@recrm.com" },
      update: {},
      create: {
        email: "agent@recrm.com",
        password: hashedPassword,
        name: "Agent Tester",
        role: "AGENT",
      },
    });

    const client = await prisma.client.upsert({
      where: { email: "crm-integration@test.com" },
      update: {},
      create: {
        name: "Integration Client",
        email: "crm-integration@test.com",
        phone: "12345678",
        type: "BUYER",
      },
    });
    testClientId = client.id;
  });

  // ─── AUTH ─────────────────────────────────────────────────────────────────

  test("0. Setup: Get tokens for admin and agent", async () => {
    const adminRes = await request(app).post("/api/auth/login").send({
      email: "admin@recrm.com",
      password: "password123",
    });
    // Auth controller returns { token: "..." }
    adminToken = adminRes.body.token;

    const agentRes = await request(app).post("/api/auth/login").send({
      email: "agent@recrm.com",
      password: "password123",
    });
    agentToken = agentRes.body.token;

    expect(adminToken).toBeDefined();
    expect(agentToken).toBeDefined();
  });

  test("1. Login Failure: Should reject invalid password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "admin@recrm.com",
      password: "wrongpassword",
    });
    expect(res.status).toBe(400);
  });

  // ─── LEAD MANAGEMENT ──────────────────────────────────────────────────────

  test("2. Lead Creation: Created lead should be linked to the creating agent", async () => {
    const res = await request(app)
      .post("/api/leads")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "John Doe", phone: "9998887776" });

    // createLead returns the Prisma object directly → res.body.id
    leadId = res.body.id;

    expect(res.status).toBe(201);
    expect(leadId).toBeDefined();
    // The lead should be assigned to the admin user who created it
    expect(res.body.agentId).toBeDefined();
  });

  test("3. RBAC: Agent should not be able to delete a lead they do not own", async () => {
    // Note: leadRoutes authorizes both ADMIN and AGENT for DELETE.
    // The 403 here comes from the ownership check in deleteLead controller
    // (lead.agentId !== agentUserId), NOT from the role middleware.
    // The lead was created by admin, so the agent is rejected at controller level.
    const res = await request(app)
      .delete(`/api/leads/${leadId}`)
      .set("Authorization", `Bearer ${agentToken}`);

    expect(res.status).toBe(403);
  });

  test("4. Lead Status Flow: Should update status from NEW to CONTACTED", async () => {
    // FIX: leadRoutes registers PUT /:id — there is no PATCH /:id for leads.
    // The original test used .patch(...) which returned 404.
    const res = await request(app)
      .put(`/api/leads/${leadId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "CONTACTED" });

    expect(res.status).toBe(200);

    // The controller returns the full updated lead, but verify via DB too
    const updatedLead = await prisma.lead.findUnique({ where: { id: leadId } });
    expect(updatedLead?.status).toBe("CONTACTED");
  });

  // ─── PROPERTY & INVENTORY ─────────────────────────────────────────────────

  test("5. Property CRUD: Should create a new property listing", async () => {
    // Note: createProperty does NOT read `status` from req.body.
    // The DB default (AVAILABLE) is used automatically via the Prisma schema.
    const res = await request(app)
      .post("/api/properties")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "Luxury Villa",
        price: 500000,
        description: "Test description",
        location: "Test Location",
        size: 2500,
        type: "RESIDENTIAL",
      });

    // createProperty returns the Prisma object directly → res.body.id
    testPropertyId = res.body.id;

    expect(res.status).toBe(201);
    expect(testPropertyId).toBeDefined();
  });

  test("6. Inventory Status: Should verify property is marked as AVAILABLE", async () => {
    const res = await request(app)
      .get("/api/properties")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);

    // getProperties returns a plain array → res.body is Property[]
    const properties: any[] = Array.isArray(res.body) ? res.body : [];
    const testProp = properties.find((p) => p.id === testPropertyId);

    expect(testProp).toBeDefined();
    // Default from schema is AVAILABLE since createProperty ignores status field
    expect(testProp.status).toBe("AVAILABLE");
  });

  // ─── DEALS & COMMISSIONS ──────────────────────────────────────────────────

  test("7. Commission Logic: Should parse string commission to a finite float", async () => {
    const res = await request(app)
      .post("/api/deals")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        clientId: testClientId,
        propertyId: testPropertyId,
        commissionAmount: "1200.50",
        stage: "NEGOTIATION",
      });

    // createDeal returns the Prisma object directly → res.body.id / .commissionAmount
    testDealId = res.body.id;
    const commission = res.body.commissionAmount;

    expect(res.status).toBe(201);
    expect(testDealId).toBeDefined();

    // FIX: `typeof Number(x)` is always "number" (even for NaN).
    // Assert it's a real finite number instead.
    expect(Number.isFinite(commission)).toBe(true);
    expect(commission).toBeCloseTo(1200.5, 2);
  });

  test("8. Kanban Stage Update: Should move deal stage to CLOSED", async () => {
    // dealRoutes: PATCH /:id/stage → updateDealStage (this path is correct)
    const res = await request(app)
      .patch(`/api/deals/${testDealId}/stage`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ stage: "CLOSED" });

    expect(res.status).toBe(200);

    // Controller returns the updated deal; also verify via DB
    const updatedDeal = await prisma.deal.findUnique({ where: { id: testDealId } });
    expect(updatedDeal?.stage).toBe("CLOSED");
    // When stage === 'CLOSED', controller auto-sets closingDate
    expect(updatedDeal?.closingDate).not.toBeNull();
  });

  // ─── ANALYTICS ────────────────────────────────────────────────────────────

  test("9. Dashboard Stats: Should return revenue summary for ADMIN", async () => {
    // dashboardRoutes: authorize(['ADMIN','MANAGER']) — adminToken has role ADMIN ✓
    const res = await request(app)
      .get("/api/dashboard/stats")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);

    // getAdminStats returns { summary: { totalRevenue, conversionRate, ... }, salesData }
    expect(res.body).toHaveProperty("summary");
    expect(res.body.summary).toHaveProperty("totalRevenue");
    expect(res.body.summary).toHaveProperty("conversionRate");
    expect(res.body.summary).toHaveProperty("activeProperties");
    expect(res.body.summary).toHaveProperty("totalLeads");
  });

  test("10. Dashboard RBAC: Agent should be denied access to admin stats", async () => {
    // agentToken has role AGENT — not in ['ADMIN','MANAGER'] → 403
    const res = await request(app)
      .get("/api/dashboard/stats")
      .set("Authorization", `Bearer ${agentToken}`);

    expect(res.status).toBe(403);
  });

  // ─── CLEANUP ──────────────────────────────────────────────────────────────

  afterAll(async () => {
    try {
      // 1. Delete deals linked to the test property (FK constraint)
      if (testPropertyId) {
        await prisma.deal.deleteMany({ where: { propertyId: testPropertyId } });
      }
      // 2. Delete any deals linked directly to testDealId that survived
      if (testDealId) {
        await prisma.deal.deleteMany({ where: { id: testDealId } });
      }
      // 3. Delete the test property
      if (testPropertyId) {
        await prisma.property.deleteMany({ where: { id: testPropertyId } });
      }
      // 4. Delete the test lead
      if (leadId) {
        // Unlink clients first (Client.leadId is nullable)
        await prisma.client.updateMany({
          where: { leadId },
          data: { leadId: null },
        });
        await prisma.lead.deleteMany({ where: { id: leadId } });
      }
    } catch (e) {
      console.error("Cleanup error:", e);
    } finally {
      await prisma.$disconnect();
    }
  });
});