import { Response, NextFunction } from 'express';
import { Customer } from '../models/Customer.js';
import { Business } from '../models/Business.js';
import { AuthenticatedRequest } from '../middlewares/auth.js';
import { NotFoundError } from '../utils/errors.js';

export const createCustomer = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, mobile, address } = req.body;

    const business = await Business.findOne({ ownerId: req.user?._id });
    if (!business) {
      throw new NotFoundError('Business profile not found');
    }

    const customer = await Customer.create({
      businessId: business._id,
      name,
      email,
      mobile,
      address,
    });

    res.status(201).json({
      status: 'success',
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

export const listCustomers = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
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

    const { search } = req.query;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
      ];
    }

    const customers = await Customer.find(query).populate('businessId').sort({ name: 1 });
    res.status(200).json({
      status: 'success',
      data: customers,
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomer = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const customer = await Customer.findById(id);

    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    res.status(200).json({
      status: 'success',
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, mobile, address } = req.body;

    const customer = await Customer.findByIdAndUpdate(
      id,
      { name, email, mobile, address },
      { new: true, runValidators: true }
    );

    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    res.status(200).json({
      status: 'success',
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCustomer = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const customer = await Customer.findByIdAndDelete(id);

    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    res.status(200).json({
      status: 'success',
      message: 'Customer deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
