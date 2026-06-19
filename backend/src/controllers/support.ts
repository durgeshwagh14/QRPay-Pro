import { Request, Response, NextFunction } from 'express';
import { SupportTicket } from '../models/SupportTicket.js';
import { SupportConfig } from '../models/SupportConfig.js';

export const createTicket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, subject, message } = req.body;
    
    if (!name || !email || !subject || !message) {
      res.status(400).json({
        status: 'error',
        message: 'All fields (name, email, subject, message) are required.',
      });
      return;
    }

    const ticket = await SupportTicket.create({
      name,
      email,
      subject,
      message,
    });

    res.status(201).json({
      status: 'success',
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};

export const getSupportConfig = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let config = await SupportConfig.findOne({});
    if (!config) {
      config = await SupportConfig.create({});
    }
    res.status(200).json({
      status: 'success',
      data: config,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSupportConfig = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { emailSupport, helpline, responseTime, emergencySettlement, merchantAssistanceText } = req.body;
    let config = await SupportConfig.findOne({});
    if (!config) {
      config = new SupportConfig({});
    }
    if (emailSupport !== undefined) config.emailSupport = emailSupport;
    if (helpline !== undefined) config.helpline = helpline;
    if (responseTime !== undefined) config.responseTime = responseTime;
    if (emergencySettlement !== undefined) config.emergencySettlement = emergencySettlement;
    if (merchantAssistanceText !== undefined) config.merchantAssistanceText = merchantAssistanceText;
    
    await config.save();
    
    res.status(200).json({
      status: 'success',
      data: config,
    });
  } catch (error) {
    next(error);
  }
};
