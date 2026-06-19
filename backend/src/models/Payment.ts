import { Schema, model, Document } from 'mongoose';

export interface IPayment extends Document {
  qrCodeId?: Schema.Types.ObjectId;
  businessId: Schema.Types.ObjectId;
  amount: number;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  gateway: 'razorpay' | 'phonepe' | 'cashfree' | 'payu';
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  gatewayRefundId?: string;
  customerName?: string;
  customerEmail?: string;
  customerMobile?: string;
  invoiceNumber?: string;
  paymentMethod?: string;
  refundStatus?: 'none' | 'pending' | 'refunded' | 'failed';
  settlementStatus?: 'pending' | 'settled';
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    qrCodeId: {
      type: Schema.Types.ObjectId,
      ref: 'QRCode',
      index: true,
    },
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },
    gateway: {
      type: String,
      enum: ['razorpay', 'phonepe', 'cashfree', 'payu'],
      required: true,
      index: true,
    },
    gatewayOrderId: {
      type: String,
      index: true,
    },
    gatewayPaymentId: {
      type: String,
      index: true,
    },
    gatewayRefundId: {
      type: String,
    },
    customerName: {
      type: String,
      trim: true,
    },
    customerEmail: {
      type: String,
      trim: true,
    },
    customerMobile: {
      type: String,
      trim: true,
    },
    invoiceNumber: {
      type: String,
      trim: true,
    },
    paymentMethod: String,
    refundStatus: {
      type: String,
      enum: ['none', 'pending', 'refunded', 'failed'],
      default: 'none',
    },
    settlementStatus: {
      type: String,
      enum: ['pending', 'settled'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

export const Payment = model<IPayment>('Payment', paymentSchema);
