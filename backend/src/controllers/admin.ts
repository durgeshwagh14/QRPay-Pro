import { Response, NextFunction } from 'express';
import { User } from '../models/User.js';
import { Business } from '../models/Business.js';
import { SupportTicket } from '../models/SupportTicket.js';
import { AuthenticatedRequest } from '../middlewares/auth.js';

export const getUsers = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 }).lean();
    
    // Fetch associated businesses for each user
    const usersWithBusinesses = await Promise.all(
      users.map(async (user) => {
        const business = await Business.findOne({ ownerId: user._id }).lean();
        return {
          ...user,
          business,
        };
      })
    );

    res.status(200).json({
      status: 'success',
      data: usersWithBusinesses,
    });
  } catch (error) {
    next(error);
  }
};

export const getTickets = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tickets = await SupportTicket.find({}).sort({ createdAt: -1 }).lean();
    res.status(200).json({
      status: 'success',
      data: tickets,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTicketStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['open', 'resolved', 'closed'].includes(status)) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid status. Allowed values: open, resolved, closed.',
      });
      return;
    }

    const ticket = await SupportTicket.findByIdAndUpdate(id, { status }, { new: true });
    if (!ticket) {
      res.status(404).json({
        status: 'error',
        message: 'Ticket not found.',
      });
      return;
    }

    res.status(200).json({
      status: 'success',
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};
