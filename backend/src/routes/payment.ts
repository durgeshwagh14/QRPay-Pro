import { Router } from 'express';
import {
  createOrder,
  verifyPayment,
  handleRazorpayWebhook,
  listTransactions,
  refundPayment,
  deletePayment,
} from '../controllers/payment.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.post('/webhook/razorpay', handleRazorpayWebhook);

router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);

router.get('/transactions', authenticate as any, listTransactions as any);
router.post('/refund/:paymentId', authenticate as any, refundPayment as any);
router.delete('/:paymentId', authenticate as any, deletePayment as any);

export default router;
