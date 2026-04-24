import request from 'supertest';
import app from '../src/index.js'; 

describe('Deal Module Tests', () => {
  // 1. DEFINE THE VARIABLES HERE
  let adminToken: string;
  let agentToken: string;
  let mockToken: string; // Use this or consolidate with agentToken

  // 2. FETCH TOKENS BEFORE RUNNING TESTS
  beforeAll(async () => {
    // Login as an Admin to get the adminToken
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@recrm.com', password: 'password123' });
    adminToken = adminRes.body.token;

    // Login as an Agent to get the agentToken
    const agentRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'agent@recrm.com', password: 'password123' });
    agentToken = agentRes.body.token;
    mockToken = agentToken; // Setting mockToken for your first test
  });

  it('should create a deal and store the correct commission', async () => {
    const response = await request(app)
      .post('/api/deals')
      .set('Authorization', `Bearer ${mockToken}`) // Now defined!
      .send({
        clientId: 'client-123',
        propertyId: 'prop-456',
        commissionAmount: '5000.50',
        stage: 'NEGOTIATION'
      });

    expect(response.status).toBe(201);
    // Verifies commission calculation logic 
    expect(response.body.commissionAmount).toBe(5000.50); 
  });

  it('should restrict an agent from accessing admin analytics', async () => {
    const response = await request(app)
      .get('/api/dashboard/stats')
      .set('Authorization', `Bearer ${agentToken}`); // Now defined!

    // Verifies Role-based permissions [cite: 65, 101]
    expect(response.status).toBe(403); 
  });
});