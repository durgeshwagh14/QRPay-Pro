import { Schema, model, Document } from 'mongoose';

export interface ISupportConfig extends Document {
  emailSupport: string;
  helpline: string;
  responseTime: string;
  emergencySettlement: string;
  merchantAssistanceText: string;
}

const supportConfigSchema = new Schema<ISupportConfig>({
  emailSupport: { type: String, default: 'Not Avaliable' },
  helpline: { type: String, default: 'Not Avaliable' },
  responseTime: { type: String, default: '10am - 6 pm' },
  emergencySettlement: { type: String, default: 'For payment gateway delays, please write to our priority settlement desk at settlements@qrpaypro.com.' },
  merchantAssistanceText: { type: String, default: 'Our support team is online 24/7 to resolve API configurations, transaction issues, gateway settlements, and logo customization settings.' },
});

export const SupportConfig = model<ISupportConfig>('SupportConfig', supportConfigSchema);
