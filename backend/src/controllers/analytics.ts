import { Response, NextFunction } from 'express';
import { Payment } from '../models/Payment.js';
import { QRCode } from '../models/QRCode.js';
import { Customer } from '../models/Customer.js';
import { Business } from '../models/Business.js';
import { AuthenticatedRequest } from '../middlewares/auth.js';
import { NotFoundError } from '../utils/errors.js';

export const getOverview = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const isAdmin = req.user?.role === 'super_admin' || req.user?.role === 'admin';
    let matchCondition: any = {};

    if (!isAdmin) {
      const business = await Business.findOne({ ownerId: req.user?._id });
      if (!business) {
        throw new NotFoundError('Business profile not found');
      }
      matchCondition.businessId = business._id;
    }

    const [
      paymentsData,
      qrCount,
      customerCount
    ] = await Promise.all([
      Payment.aggregate([
        { $match: matchCondition },
        {
          $group: {
            _id: null,
            totalRevenue: {
              $sum: { $cond: [{ $eq: ['$status', 'success'] }, '$amount', 0] }
            },
            totalCount: { $sum: 1 },
            successCount: {
              $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] }
            },
            failedCount: {
              $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
            },
          }
        }
      ]),
      QRCode.countDocuments(matchCondition),
      Customer.countDocuments(matchCondition),
    ]);

    const stats = paymentsData[0] || {
      totalRevenue: 0,
      totalCount: 0,
      successCount: 0,
      failedCount: 0,
    };

    res.status(200).json({
      status: 'success',
      data: {
        revenue: stats.totalRevenue,
        totalTransactions: stats.totalCount,
        successfulPayments: stats.successCount,
        failedPayments: stats.failedCount,
        qrGenerated: qrCount,
        activeCustomers: customerCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getRevenueTrend = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const isAdmin = req.user?.role === 'super_admin' || req.user?.role === 'admin';
    let matchCondition: any = { status: 'success' };

    if (!isAdmin) {
      const business = await Business.findOne({ ownerId: req.user?._id });
      if (!business) {
        throw new NotFoundError('Business profile not found');
      }
      matchCondition.businessId = business._id;
    }

    const { period } = req.query;

    let format = '%Y-%m-%d';
    let daysToSubtract = 30;

    if (period === 'weekly') {
      format = '%Y-%U';
      daysToSubtract = 90;
    } else if (period === 'monthly') {
      format = '%Y-%m';
      daysToSubtract = 365;
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysToSubtract);
    matchCondition.createdAt = { $gte: startDate };

    const trend = await Payment.aggregate([
      {
        $match: matchCondition
      },
      {
        $group: {
          _id: { $dateToString: { format, date: '$createdAt' } },
          revenue: { $sum: '$amount' },
          transactions: { $sum: 1 },
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      status: 'success',
      data: trend.map(t => ({
        label: t._id,
        revenue: t.revenue,
        transactions: t.transactions,
      })),
    });
  } catch (error) {
    next(error);
  }
};
