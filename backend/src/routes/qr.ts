import { Router } from 'express';
import {
  createQRCode,
  getQRCode,
  listQRCodes,
  deleteQRCode,
  getQRCodeByShortId,
} from '../controllers/qr.js';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { createQRSchema } from '../utils/validators.js';

const router = Router();

router.get('/short/:shortId', getQRCodeByShortId);

router.post('/', authenticate as any, validate(createQRSchema), createQRCode as any);
router.get('/', authenticate as any, listQRCodes as any);
router.get('/:id', authenticate as any, getQRCode as any);
router.delete('/:id', authenticate as any, deleteQRCode as any);

export default router;
