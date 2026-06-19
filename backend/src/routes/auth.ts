import { Router } from 'express';
import {
  register,
  verifyEmail,
  login,
  refresh,
  logout,
  getMe,
  updateProfile,
  deleteAccount,
  resetPassword,
  changePassword,
} from '../controllers/auth.js';
import { validate } from '../middlewares/validate.js';
import { authenticate } from '../middlewares/auth.js';
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
} from '../utils/validators.js';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/verify-email', validate(verifyEmailSchema), verifyEmail);
router.post('/login', validate(loginSchema), login);
router.post('/reset-password', resetPassword);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', authenticate as any, getMe);
router.put('/profile', authenticate as any, updateProfile);
router.post('/change-password', authenticate as any, changePassword as any);
router.delete('/delete-account', authenticate as any, deleteAccount as any);

export default router;
