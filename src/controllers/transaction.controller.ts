import { NextFunction, Request, Response } from 'express';
import Transaction, { ITransaction } from '../models/transaction.model';
import { adjustCustomerBalance } from './customer.controller';


// Add a new transaction
export const addTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
      const { type, customerId, products, date, customerName, total, note, paymentType } = req.body;

      console.log("Transaction data: ", req.body);

      const newTransaction: ITransaction = new Transaction({
          type,
          customerId,
          customerName,
          products,
          total,
          note,
          date,
          paymentType,
      });

      await newTransaction.save();

      // Adjust balance only if it's a DUE and customer exists
      if (paymentType === 'due' && customerId) {
          await adjustCustomerBalance(newTransaction);
      }

      res.status(201).json(newTransaction);
  } catch (error) {
      next(error);
  }
};


// Get Transactions with Pagination, Search, Type and Date Filtering
export const getTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = "", 
      type, 
      dateFrom, 
      dateTo 
    } = req.query;

    // Build base query
    const query: any = {};


    console.log("from: ", dateFrom," to: ", dateTo);

    // Type filter
    if (type && type !== "all") {
      query.type = type;
    }

    // Date range filter
    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) {
        const fromDate = new Date(dateFrom as string);
        fromDate.setUTCHours(0, 0, 0, 0);
        query.date.$gte = fromDate;
      }
      if (dateTo) {
        const toDate = new Date(dateTo as string);
        toDate.setUTCHours(23, 59, 59, 999);
        query.date.$lte = toDate;
      }
    }

    // Search filter
    if (search) {
      query.$or = [
        { note: { $regex: search, $options: "i" } },
        { customerName: { $regex: search, $options: "i" } }
      ];
    }

    // Get transactions with pagination
    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .populate('customerId', 'name')
        .populate('products.productId', 'name')
        .sort({ date: -1 })
        .skip((+page - 1) * +limit)
        .limit(+limit)
        .lean(),
      
      Transaction.countDocuments(query)
    ]);

    res.json({
      data: transactions,
      currentPage: +page,
      totalPages: Math.ceil(total / +limit),
      totalItems: total,
    });

  } catch (error) {
    next(error);
  }
};
  
  
  

// Get total calculations
export const getTotals = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const transactions = await Transaction.find();
    const totalSales = transactions
        .filter(t => t.type === 'sell')
        .reduce((sum, t) => sum + t.total, 0);

    const totalBuys = transactions
        .filter(t => t.type === 'buy')
        .reduce((sum, t) => sum + t.total, 0);

    const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.total, 0);

    const remainingCash = totalSales - totalBuys - totalExpenses;

    res.json({
        totalSales,
        totalBuys,
        totalExpenses,
        remainingCash,
    });
    } catch (error) {
        next(error);
    }
};