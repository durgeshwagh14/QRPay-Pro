import { Request, Response, NextFunction } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { Payment } from '../models/Payment.js';
import { QRCode } from '../models/QRCode.js';
import { Business } from '../models/Business.js';
import { AuthenticatedRequest } from '../middlewares/auth.js';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../utils/errors.js';
import logger from '../utils/logger.js';
import { env } from '../config/env.js';

let razorpayInstance: Razorpay | null = null;

if (env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET) {
  razorpayInstance = new Razorpay({
    key_id: env.RAZORPAY_KEY_ID,
    key_secret: env.RAZORPAY_KEY_SECRET,
  });
  logger.info('💳 Razorpay client initialized successfully');
} else {
  logger.warn('⚠️ Razorpay keys are not configured. Running payments in Mock Development Mode!');
}

export const createOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { qrCodeId, customerName, customerEmail, customerMobile } = req.body;

    const qrCode = await QRCode.findById(qrCodeId).populate('businessId');
    if (!qrCode) {
      throw new NotFoundError('QR Code not found');
    }

    const business = qrCode.businessId as any;
    const amountInPaise = Math.round(qrCode.amount * 100);

    let gatewayOrderId = `mock_order_${crypto.randomBytes(8).toString('hex')}`;

    if (razorpayInstance) {
      try {
        const order = await razorpayInstance.orders.create({
          amount: amountInPaise,
          currency: 'INR',
          receipt: qrCode._id.toString(),
        });
        gatewayOrderId = order.id;
      } catch (err: any) {
        logger.error('Razorpay order creation error: %o', err);
        throw new BadRequestError(`Razorpay Order Creation Failed: ${err.message}`);
      }
    } else {
      logger.info(`✨ Generated Mock Razorpay Order ID: ${gatewayOrderId}`);
    }

    const payment = await Payment.create({
      qrCodeId: qrCode._id,
      businessId: business._id,
      amount: qrCode.amount,
      status: 'pending',
      gateway: 'razorpay',
      gatewayOrderId,
      customerName: customerName || qrCode.customerName,
      customerEmail,
      customerMobile,
      invoiceNumber: qrCode.invoiceNumber,
    });

    res.status(201).json({
      status: 'success',
      data: {
        orderId: gatewayOrderId,
        amount: qrCode.amount,
        currency: 'INR',
        keyId: env.RAZORPAY_KEY_ID || 'mock_razorpay_key_id',
        paymentId: payment._id,
        businessName: business.name,
        businessLogo: business.logo,
        brandColor: business.brandColor,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      throw new NotFoundError('Payment record not found');
    }

    if (razorpayInstance && razorpay_signature) {
      const generatedSignature = crypto
        .createHmac('sha256', env.RAZORPAY_KEY_SECRET!)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (generatedSignature !== razorpay_signature) {
        payment.status = 'failed';
        await payment.save();
        throw new BadRequestError('Payment signature verification failed. Possible fraud attempt.');
      }
    } else {
      logger.info(`✨ Mocking verification success for order: ${razorpay_order_id}`);
    }

    payment.status = 'success';
    payment.gatewayPaymentId = razorpay_payment_id || `mock_pay_${crypto.randomBytes(8).toString('hex')}`;
    payment.paymentMethod = 'upi';
    await payment.save();

    res.status(200).json({
      status: 'success',
      message: 'Payment verified successfully.',
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

export const handleRazorpayWebhook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'] as string;

    if (webhookSecret && signature) {
      const shasum = crypto.createHmac('sha256', webhookSecret);
      shasum.update(JSON.stringify(req.body));
      const digest = shasum.digest('hex');

      if (digest !== signature) {
        throw new UnauthorizedError('Invalid webhook signature');
      }
    }

    const event = req.body.event;
    const payload = req.body.payload;

    if (event === 'payment.captured' || event === 'order.paid') {
      const orderId = payload.payment.entity.order_id;
      const paymentId = payload.payment.entity.id;
      const paymentMethod = payload.payment.entity.method;

      const dbPayment = await Payment.findOne({ gatewayOrderId: orderId });
      if (dbPayment && dbPayment.status !== 'success') {
        dbPayment.status = 'success';
        dbPayment.gatewayPaymentId = paymentId;
        dbPayment.paymentMethod = paymentMethod;
        await dbPayment.save();
        logger.info(`🚨 Webhook: Updated payment for order ${orderId} to success`);
      }
    } else if (event === 'payment.failed') {
      const orderId = payload.payment.entity.order_id;
      const dbPayment = await Payment.findOne({ gatewayOrderId: orderId });
      if (dbPayment && dbPayment.status === 'pending') {
        dbPayment.status = 'failed';
        await dbPayment.save();
        logger.info(`🚨 Webhook: Updated payment for order ${orderId} to failed`);
      }
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    next(error);
  }
};

export const listTransactions = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
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

    const transactions = await Payment.find(query)
      .populate('qrCodeId')
      .populate('businessId')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};

export const refundPayment = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      throw new NotFoundError('Payment transaction not found');
    }

    const business = await Business.findOne({ ownerId: req.user?._id });
    if (!business || (payment.businessId.toString() !== business._id.toString())) {
      throw new UnauthorizedError('Unauthorized to refund this payment');
    }

    if (payment.status !== 'success') {
      throw new BadRequestError('Only successful payments can be refunded');
    }

    let gatewayRefundId = `mock_ref_${crypto.randomBytes(8).toString('hex')}`;

    if (razorpayInstance && payment.gatewayPaymentId && !payment.gatewayPaymentId.startsWith('mock_')) {
      try {
        const refund = await razorpayInstance.payments.refund(payment.gatewayPaymentId, {
          amount: Math.round(payment.amount * 100),
        });
        gatewayRefundId = refund.id;
      } catch (err: any) {
        logger.error('Razorpay refund error: %o', err);
        throw new BadRequestError(`Razorpay Refund Failed: ${err.message}`);
      }
    }

    payment.status = 'refunded';
    payment.refundStatus = 'refunded';
    payment.gatewayRefundId = gatewayRefundId;
    await payment.save();

    res.status(200).json({
      status: 'success',
      message: 'Payment refunded successfully',
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

export const deletePayment = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      throw new NotFoundError('Payment transaction not found');
    }

    const isAdmin = req.user?.role === 'super_admin' || req.user?.role === 'admin';
    if (!isAdmin) {
      const business = await Business.findOne({ ownerId: req.user?._id });
      if (!business || (payment.businessId.toString() !== business._id.toString())) {
        throw new UnauthorizedError('Unauthorized to delete this payment');
      }
    }

    await Payment.findByIdAndDelete(paymentId);

    res.status(200).json({
      status: 'success',
      message: 'Payment transaction deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
