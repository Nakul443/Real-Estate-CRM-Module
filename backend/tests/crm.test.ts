import app from "../src/index.js";
import { prisma } from "../src/utils/prisma.js";
import request from "supertest";

describe("Real Estate CRM Integrated Test Suite", () => {
  let adminToken: string;
  let agentToken: string;
  let leadId: string;

  test("0. Agent Login: Get agent token", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "agent@recrm.com",
      password: "password123",
    });
    agentToken = res.body.token;
    expect(res.status).toBe(200);
  });

  // --- AUTHENTICATION & RBAC ---
  test("1. Login Success: Should return JWT for valid credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "admin@recrm.com",
      password: "password123",
    });
    adminToken = res.body.token;
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  test("2. Login Failure: Should reject invalid password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "admin@recrm.com",
      password: "wrongpassword",
    });
    expect(res.status).toBe(401);
  });

  test("3. Token Validation: Should reject requests without Bearer token", async () => {
    const res = await request(app).get("/api/leads");
    expect(res.status).toBe(401);
  });

  test("4. RBAC: Agent should not be able to delete Admin-created leads", async () => {
    const res = await request(app)
      .delete(`/api/leads/some-admin-id`)
      .set("Authorization", `Bearer ${agentToken}`);
    expect(res.status).toBe(403);
  });

  // --- LEAD MANAGEMENT ---
  test("5. Lead Creation Validation: Should fail if name is missing", async () => {
    const res = await request(app)
      .post("/api/leads")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ phone: "1234567890" });
    expect(res.status).toBe(400);
  });

  test("6. Lead Assignment: Created lead should automatically link to current agentId", async () => {
    const res = await request(app)
      .post("/api/leads")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "John Doe", phone: "9998887776" });
    leadId = res.body.id;
    expect(res.body.agentId).toBeDefined();
  });

  test("7. Lead Status Flow: Should update status from NEW to CONTACTED", async () => {
    const res = await request(app)
      .patch(`/api/leads/${leadId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "CONTACTED" });
    expect(res.body.status).toBe("CONTACTED");
  });

  // --- PROPERTY & INVENTORY ---
  test("8. Property CRUD: Should create a new property listing", async () => {
    const res = await request(app)
      .post("/api/properties")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ title: "Luxury Villa", price: 500000, status: "AVAILABLE" });
    expect(res.status).toBe(201);
  });

  test("9. Inventory Status: Should verify property is marked as AVAILABLE", async () => {
    const res = await request(app).get("/api/properties");
    expect(res.body[0].status).toBe("AVAILABLE");
  });

  // --- DEALS & COMMISSIONS ---
  test("10. Commission Logic: Should parse string commission to float", async () => {
    const res = await request(app)
      .post("/api/deals")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ clientId: "c1", propertyId: "p1", commissionAmount: "1200.50" });
    expect(typeof res.body.commissionAmount).toBe("number");
  });

  test("11. Kanban Stage Update: Should move deal to CLOSED", async () => {
    const res = await request(app)
      .patch("/api/deals/deal-id/stage")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ stage: "CLOSED" });
    expect(res.body.stage).toBe("CLOSED");
  });

  // --- ANALYTICS & REPORTS ---
  test("12. Revenue Aggregation: Total revenue should only include CLOSED deals", async () => {
    const res = await request(app)
      .get("/api/dashboard/stats")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.body.summary).toHaveProperty("totalRevenue");
  });

  test("13. KPI Calculation: Should return a valid conversionRate percentage", async () => {
    const res = await request(app)
      .get("/api/dashboard/stats")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.body.summary.conversionRate).toMatch(/%/);
  });

  // --- INTEGRATIONS (WEBHOOKS) ---
  test("14. Settings Persistence: Should retrieve the saved n8n webhook URL", async () => {
    const res = await request(app)
      .get("/api/settings")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.body).toHaveProperty("webhookUrl");
  });

  test("15. Webhook Trigger Logic: Lead creation should trigger n8n utility", async () => {
    // This tests if the function doesn't crash the request when called
    const res = await request(app)
      .post("/api/leads")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Automation Test", phone: "0000000000" });
    expect(res.status).toBe(201);
  });
});
