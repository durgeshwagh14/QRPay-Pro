import { Response, NextFunction } from 'express';
import { QRCode } from '../models/QRCode.js';
import { Business } from '../models/Business.js';
import { AuthenticatedRequest } from '../middlewares/auth.js';
import { BadRequestError, NotFoundError } from '../utils/errors.js';
import crypto from 'crypto';

export const createQRCode = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { amount, customerName, invoiceNumber, description, expiryTime, notes, upiIdUsed } = req.body;

    const business = await Business.findOne({ ownerId: req.user?._id });
    if (!business) {
      throw new NotFoundError('Business profile not found. Please setup business profile first.');
    }

    if (!business.upiIds.includes(upiIdUsed)) {
      throw new BadRequestError('The specified UPI ID is not registered for your business.');
    }

    const shortUrlId = crypto.randomBytes(6).toString('hex');

    const qrCode = await QRCode.create({
      businessId: business._id,
      upiIdUsed,
      amount,
      customerName,
      invoiceNumber,
      description,
      expiryTime: expiryTime ? new Date(expiryTime) : undefined,
      notes,
      shortUrlId,
      createdBy: req.user?._id,
    });

    res.status(201).json({
      status: 'success',
      data: {
        qrCode,
        paymentUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/pay/${shortUrlId}`,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getQRCode = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const qrCode = await QRCode.findById(id).populate('businessId');
    if (!qrCode) {
      throw new NotFoundError('QR Code not found');
    }
    res.status(200).json({
      status: 'success',
      data: qrCode,
    });
  } catch (error) {
    next(error);
  }
};

export const getQRCodeByShortId = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { shortId } = req.params;
    const qrCode = await QRCode.findOne({ shortUrlId: shortId }).populate('businessId');
    if (!qrCode) {
      throw new NotFoundError('QR Code not found');
    }
    res.status(200).json({
      status: 'success',
      data: qrCode,
    });
  } catch (error) {
    next(error);
  }
};

export const listQRCodes = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const isAdmin = req.user?.role === 'super_admin' || req.user?.role === 'admin';
    let query: any = {};

    if (!isAdmin) {
      const business = await Business.findOne({ ownerId: req.user?._id });
      if (!business) {
        res.status(200).json({ status: 'success', data: [] });
        return;
      }
      query.businessId = business._id;
    }

    const qrCodes = await QRCode.find(query).populate('businessId').sort({ createdAt: -1 });
    res.status(200).json({
      status: 'success',
      data: qrCodes,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteQRCode = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const qrCode = await QRCode.findOneAndDelete({ _id: id, createdBy: req.user?._id });
    if (!qrCode) {
      throw new NotFoundError('QR Code not found or you are not authorized to delete it');
    }
    res.status(200).json({
      status: 'success',
      message: 'QR Code deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
