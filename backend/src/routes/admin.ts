import { Router } from 'express';
import { getUsers, getTickets, updateTicketStatus } from '../controllers/admin.js';
import { updateSupportConfig } from '../controllers/support.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = Router();

// Apply auth middlewares (accessible only to admin or super_admin)
router.use(authenticate as any);
router.use(authorize('super_admin', 'admin') as any);

router.get('/users', getUsers as any);
router.get('/tickets', getTickets as any);
router.patch('/tickets/:id/status', updateTicketStatus as any);
router.put('/support/config', updateSupportConfig as any);

export default router;
