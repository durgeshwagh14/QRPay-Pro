import { Schema, model, Document } from 'mongoose';

export interface IAuditLog extends Document {
  userId?: Schema.Types.ObjectId;
  action: string;
  ipAddress?: string;
  userAgent?: string;
  details?: any;
  severity: 'info' | 'warn' | 'error' | 'critical';
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    ipAddress: String,
    userAgent: String,
    details: Schema.Types.Mixed,
    severity: {
      type: String,
      enum: ['info', 'warn', 'error', 'critical'],
      default: 'info',
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

export const AuditLog = model<IAuditLog>('AuditLog', auditLogSchema);
