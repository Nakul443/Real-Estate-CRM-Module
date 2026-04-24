import request from 'supertest';
import app from '../src/index.js'; 
import { prisma } from '../src/utils/prisma.js';

describe('Deal Module Tests', () => {
  let adminToken: string;
  let agentToken: string;
  let testClientId: string;
  let testPropertyId: string;

  beforeAll(async () => {
    // 1. Get Tokens
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@recrm.com', password: 'password123' });
    adminToken = adminRes.body.token;

    const agentRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'agent@recrm.com', password: 'password123' });
    agentToken = agentRes.body.token;

    // 2. Create actual DB records to satisfy Foreign Key constraints
    const client = await prisma.client.upsert({
      where: { email: 'testclient@example.com' },
      update: {},
      create: { 
        name: 'Test Client', 
        email: 'testclient@example.com', 
        phone: '123456789',
        type: 'BUYER' 
      }
    });
    testClientId = client.id;

    // UPDATED PROPERTY SEED
    const property = await prisma.property.create({
      data: { 
        title: 'Test Villa', 
        price: 100000, 
        status: 'AVAILABLE',
        description: 'A beautiful test villa', // Added
        location: 'Test City',                // Added
        size: 2000,                           // Added
        type: 'RESIDENTIAL',                  // Added (Check your enum if this fails)
        agent: {
          connect: { email: 'admin@recrm.com' } // Connects it to the admin user we seeded
        }
      }
    });
    testPropertyId = property.id;
  });

  it('should create a deal and store the correct commission', async () => {
    const response = await request(app)
      .post('/api/deals')
      .set('Authorization', `Bearer ${agentToken}`)
      .send({
        clientId: testClientId,
        propertyId: testPropertyId,
        commissionAmount: '5000.50',
        stage: 'NEGOTIATION'
      });

    expect(response.status).toBe(201);
    expect(response.body.commissionAmount).toBe(5000.50); 
  });

  it('should restrict an agent from accessing admin analytics', async () => {
    const response = await request(app)
      .get('/api/dashboard/stats')
      .set('Authorization', `Bearer ${agentToken}`);

    expect(response.status).toBe(403); 
  });

  afterAll(async () => {
    // Cleanup
    await prisma.deal.deleteMany({ where: { clientId: testClientId } });
    await prisma.property.deleteMany({ where: { id: testPropertyId } });
  });
});