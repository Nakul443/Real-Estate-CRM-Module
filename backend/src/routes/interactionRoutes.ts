import { Router } from 'express';
import { logInteraction, getClientInteractions } from '../controllers/interactionController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

// Any authenticated agent can log or view interactions
router.post('/', authenticate, logInteraction);
router.get('/:clientId', authenticate, getClientInteractions);

export default router;