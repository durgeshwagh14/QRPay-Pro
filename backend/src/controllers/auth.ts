import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.js';
import { Business } from '../models/Business.js';
import { OTP } from '../models/OTP.js';
import { Session } from '../models/Session.js';
import { AuditLog } from '../models/AuditLog.js';
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  generateOTPCode,
} from '../utils/auth.js';
import {
  BadRequestError,
  UnauthorizedError,
  ConflictError,
  NotFoundError,
} from '../utils/errors.js';
import { emailService } from '../services/email.js';
import { env } from '../config/env.js';

const loginFailures = new Map<string, { count: number; lockUntil?: number }>();

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { businessName, ownerName, email, mobile, password, upiId, address } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ConflictError('A user with this email already exists.');
    }

    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      email,
      password: hashedPassword,
      ownerName,
      mobile,
      role: 'owner',
    });

    const business = await Business.create({
      ownerId: user._id,
      name: businessName,
      upiIds: [upiId],
      address: address || {},
    });

    const otpCode = generateOTPCode();
    await OTP.create({
      emailOrMobile: email,
      otp: otpCode,
      type: 'email_verification',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    await emailService.sendOTP(email, otpCode, 'Email Verification');

    await AuditLog.create({
      userId: user._id,
      action: 'auth.register',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      severity: 'info',
      details: { businessId: business._id },
    });

    res.status(201).json({
      status: 'success',
      message: 'Registration successful. Verification OTP sent to email.',
      data: {
        userId: user._id,
        email: user.email,
        businessId: business._id,
        otp: otpCode,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, otp } = req.body;

    const otpRecord = await OTP.findOne({
      emailOrMobile: email,
      otp,
      type: 'email_verification',
    });

    if (!otpRecord) {
      throw new BadRequestError('Invalid or expired OTP');
    }

    const user = await User.findOneAndUpdate(
      { email },
      { isEmailVerified: true },
      { new: true }
    );

    if (!user) {
      throw new NotFoundError('User not found');
    }

    await OTP.deleteOne({ _id: otpRecord._id });

    await AuditLog.create({
      userId: user._id,
      action: 'auth.verify_email',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      severity: 'info',
    });

    res.status(200).json({
      status: 'success',
      message: 'Email verified successfully. You can now login.',
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    const clientIp = req.ip || 'unknown';

    const failureRecord = loginFailures.get(email);
    if (failureRecord && failureRecord.lockUntil && failureRecord.lockUntil > Date.now()) {
      const remainingTime = Math.ceil((failureRecord.lockUntil - Date.now()) / 1000 / 60);
      throw new BadRequestError(`Account is temporarily locked. Try again in ${remainingTime} minutes.`);
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      recordLoginFailure(email);
      throw new UnauthorizedError('Invalid credentials');
    }

    const isMatch = await comparePassword(password, user.password || '');
    if (!isMatch) {
      recordLoginFailure(email);
      throw new UnauthorizedError('Invalid credentials');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedError('Please verify your email address before logging in.');
    }

    loginFailures.delete(email);

    const accessToken = generateAccessToken({ userId: user._id.toString(), role: user.role });
    const refreshToken = generateRefreshToken({ userId: user._id.toString() });

    const sessionExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await Session.create({
      userId: user._id,
      refreshToken,
      ipAddress: clientIp,
      userAgent: req.headers['user-agent'],
      expiresAt: sessionExpiry,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: sessionExpiry,
    });

    await AuditLog.create({
      userId: user._id,
      action: 'auth.login',
      ipAddress: clientIp,
      userAgent: req.headers['user-agent'],
      severity: 'info',
    });

    res.status(200).json({
      status: 'success',
      token: accessToken,
      data: {
        id: user._id,
        email: user.email,
        role: user.role,
        ownerName: user.ownerName,
      },
    });
  } catch (error) {
    next(error);
  }
};

const recordLoginFailure = (email: string) => {
  const record = loginFailures.get(email) || { count: 0 };
  record.count += 1;
  if (record.count >= 5) {
    record.lockUntil = Date.now() + 15 * 60 * 1000;
  }
  loginFailures.set(email, record);
};

export const refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedError('Refresh token missing');
    }

    const session = await Session.findOne({ refreshToken });
    if (!session) {
      throw new UnauthorizedError('Invalid session or token');
    }

    if (session.expiresAt < new Date()) {
      await Session.deleteOne({ _id: session._id });
      throw new UnauthorizedError('Session expired');
    }

    const user = await User.findById(session.userId);
    if (!user) {
      throw new UnauthorizedError('User no longer exists');
    }

    const newAccessToken = generateAccessToken({ userId: user._id.toString(), role: user.role });
    const newRefreshToken = generateRefreshToken({ userId: user._id.toString() });
    const sessionExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    session.refreshToken = newRefreshToken;
    session.expiresAt = sessionExpiry;
    await session.save();

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: sessionExpiry,
    });

    res.status(200).json({
      status: 'success',
      token: newAccessToken,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (refreshToken) {
      await Session.deleteOne({ refreshToken });
    }
    res.clearCookie('refreshToken');
    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const business = await Business.findOne({ ownerId: req.user._id });
    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: req.user._id,
          email: req.user.email,
          role: req.user.role,
          ownerName: req.user.ownerName,
          mobile: req.user.mobile,
          isEmailVerified: req.user.isEmailVerified,
          isMobileVerified: req.user.isMobileVerified,
          avatar: req.user.avatar,
        },
        business,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { ownerName, mobile, businessName, upiId, upiIds, logo, tagline, brandColor } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { ownerName, mobile },
      { new: true }
    );

    const business = await Business.findOneAndUpdate(
      { ownerId: req.user._id },
      {
        name: businessName,
        upiIds: upiIds || (upiId ? [upiId] : undefined),
        logo,
        tagline,
        brandColor,
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user?._id,
          email: user?.email,
          role: user?.role,
          ownerName: user?.ownerName,
          mobile: user?.mobile,
          isEmailVerified: user?.isEmailVerified,
          avatar: user?.avatar,
        },
        business,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user._id;

    // Delete business records
    await Business.deleteOne({ ownerId: userId });
    
    // Delete session records
    await Session.deleteMany({ userId });
    
    // Delete user account
    await User.findByIdAndDelete(userId);

    res.clearCookie('refreshToken');
    res.status(200).json({
      status: 'success',
      message: 'Your account and all associated business data has been permanently deleted.',
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, previousPassword, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      throw new BadRequestError('New password and confirm password do not match.');
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new NotFoundError('User with this email not found.');
    }

    const isMatch = await comparePassword(previousPassword, user.password || '');
    if (!isMatch) {
      throw new BadRequestError('Previous password incorrect.');
    }

    const hashedPassword = await hashPassword(newPassword);
    user.password = hashedPassword;
    await user.save();

    await AuditLog.create({
      userId: user._id,
      action: 'auth.reset_password',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      severity: 'info',
    });

    res.status(200).json({
      status: 'success',
      message: 'Password reset successfully. You can now login with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user?._id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      throw new BadRequestError('All password fields are required.');
    }

    if (newPassword !== confirmPassword) {
      throw new BadRequestError('New password and confirm password do not match.');
    }

    if (newPassword.length < 6) {
      throw new BadRequestError('New password must be at least 6 characters.');
    }

    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw new NotFoundError('User not found.');
    }

    const isMatch = await comparePassword(currentPassword, user.password || '');
    if (!isMatch) {
      throw new BadRequestError('Current password is incorrect.');
    }

    if (currentPassword === newPassword) {
      throw new BadRequestError('New password must be different from your current password.');
    }

    user.password = await hashPassword(newPassword);
    await user.save();

    await AuditLog.create({
      userId: user._id,
      action: 'auth.change_password',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      severity: 'info',
    });

    res.status(200).json({
      status: 'success',
      message: 'Password changed successfully.',
    });
  } catch (error) {
    next(error);
  }
};
