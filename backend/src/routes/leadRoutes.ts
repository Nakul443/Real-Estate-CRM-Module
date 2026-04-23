// defines the URL paths for lead-related actions
// connects the controller logic to specific HTTP methods (POST, GET, PATCH)
// uses authenticate to verify JWT and authorize for role-based access

import { Router } from 'express';
import { createLead, getLeads, updateLead, deleteLead } from '../controllers/leadController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';

const router = Router();

// 1. Create a new lead
// Accessible by both Admin and Agents
router.post('/', authenticate, authorize(['ADMIN', 'AGENT']), createLead);

// 2. Retrieve leads
// Admin gets all, Agent gets only their own (handled in controller)
router.get('/', authenticate, authorize(['ADMIN', 'AGENT']), getLeads);

// 3. Update a full lead (Added for your edit modal)
router.put('/:id', authenticate, authorize(['ADMIN', 'AGENT']), updateLead);

// 4. Delete a lead (Added for your delete button)
router.delete('/:id', authenticate, authorize(['ADMIN', 'AGENT']), deleteLead);

export default router;