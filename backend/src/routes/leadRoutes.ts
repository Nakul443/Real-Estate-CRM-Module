// defines the URL paths for lead-related actions
// connects the controller logic to specific HTTP methods (POST, GET, PATCH)
// uses authenticate to verify JWT and authorize for role-based access

import { Router } from 'express';
import { createLead, getLeads, updateLeadStatus } from '../controllers/leadController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';

const router = Router();

// 1. Create a new lead
// Accessible by both Admin and Agents
router.post('/', authenticate, authorize(['ADMIN', 'AGENT']), createLead);

// 2. Retrieve leads
// Admin gets all, Agent gets only their own (handled in controller)
router.get('/', authenticate, authorize(['ADMIN', 'AGENT']), getLeads);

// 3. Update a lead's status
// Only the owner or an Admin can perform this (ownership checked in controller)
router.patch('/:id/status', authenticate, authorize(['ADMIN', 'AGENT']), updateLeadStatus);

export default router;