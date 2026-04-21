import { Router } from 'express';
import { createLead, getLeads, updateLeadStatus } from '../controllers/leadController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';

const router = Router();

// Everyone (Admin & Agent) can create or view leads
router.post('/', authenticate, authorize(['ADMIN', 'AGENT']), createLead);
router.get('/', authenticate, authorize(['ADMIN', 'AGENT']), getLeads);
router.patch('/:id/status', authenticate, authorize(['ADMIN', 'AGENT']), updateLeadStatus);

export default router;