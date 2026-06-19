import { Schema, model, Document } from 'mongoose';

export interface IBusiness extends Document {
  ownerId: Schema.Types.ObjectId;
  name: string;
  gstin?: string;
  pan?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  upiIds: string[];
  logo?: string;
  brandColor?: string;
  tagline?: string;
  createdAt: Date;
  updatedAt: Date;
}

const businessSchema = new Schema<IBusiness>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    gstin: {
      type: String,
      trim: true,
    },
    pan: {
      type: String,
      trim: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zip: String,
      country: String,
    },
    upiIds: {
      type: [String],
      required: true,
      validate: {
        validator: function(v: string[]) {
          return v.length > 0;
        },
        message: 'A business must have at least one UPI ID.'
      }
    },
    logo: String,
    brandColor: {
      type: String,
      default: '#000000',
    },
    tagline: String,
  },
  {
    timestamps: true,
  }
);

export const Business = model<IBusiness>('Business', businessSchema);
