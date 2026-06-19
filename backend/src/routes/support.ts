import { Router } from 'express';
import { createTicket, getSupportConfig } from '../controllers/support.js';

const router = Router();

router.post('/tickets', createTicket as any);
router.get('/config', getSupportConfig as any);

export default router;
