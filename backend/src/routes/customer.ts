import { Router } from 'express';
import {
  createCustomer,
  listCustomers,
  getCustomer,
  updateCustomer,
  deleteCustomer,
} from '../controllers/customer.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate as any);

router.post('/', createCustomer as any);
router.get('/', listCustomers as any);
router.get('/:id', getCustomer as any);
router.put('/:id', updateCustomer as any);
router.delete('/:id', deleteCustomer as any);

export default router;
