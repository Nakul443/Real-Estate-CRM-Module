import { Router } from 'express';
import { createProperty, getProperties, updateProperty, deleteProperty } from '../controllers/propertyController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';
import { upload } from '../utils/cloudinary.js';

const router = Router();

// Only Admins and Agents can add properties [cite: 22, 60]
router.post('/', authenticate, authorize(['ADMIN', 'AGENT']), upload.array('images',5), createProperty);
router.get('/', authenticate, getProperties);
router.patch('/:id', authenticate, updateProperty);
router.delete('/:id', authenticate, deleteProperty);

export default router;