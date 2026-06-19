import { Schema, model, Document } from 'mongoose';

export interface IQRCode extends Document {
  businessId: Schema.Types.ObjectId;
  upiIdUsed: string;
  amount: number;
  customerName?: string;
  invoiceNumber?: string;
  description?: string;
  expiryTime?: Date;
  notes?: string;
  qrCodeDataUrl?: string;
  shortUrlId: string;
  createdBy: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const qrCodeSchema = new Schema<IQRCode>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
      index: true,
    },
    upiIdUsed: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    customerName: {
      type: String,
      trim: true,
    },
    invoiceNumber: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    expiryTime: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
    qrCodeDataUrl: {
      type: String,
    },
    shortUrlId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const QRCode = model<IQRCode>('QRCode', qrCodeSchema);
