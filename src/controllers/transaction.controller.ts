import { NextFunction, Request, Response } from 'express';
import { adjustDuesReceivables } from './customer.controller';
import Transaction, { ITransaction } from '../models/transaction.model';


// Add a new transaction
export const addTransaction = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { type, customerId, productId, amount, note } = req.body;
    const newTransaction: ITransaction = new Transaction({
        type,
        customerId,
        productId,
        amount,
        note,
    });

    console.log(customerId);
    await newTransaction.save();

    // Adjust dues/receivables if the transaction involves a customer
    if (customerId) {
        await adjustDuesReceivables(newTransaction);
    }

    res.status(201).json(newTransaction);
    } catch (error) {
        next(error);
    }
};

// Get Transactions with Pagination, Search, Type and Date Filtering
export const getTransactions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page = 1, limit = 10, search = "", type, date } = req.query;
  
      const match: any = {};
  
      // Type filter
      if (type && type !== "all") {
        match.type = type;
      }
  
      // Date filter (filtering on 'date' field, not 'createdAt')
      if (date) {
        const userDate = new Date(date as string);
        const start = new Date(userDate.setHours(0, 0, 0, 0));
        const end = new Date(userDate.setHours(23, 59, 59, 999));
  
        match.date = { $gte: start, $lte: end };
      }
  
      const pipeline: any[] = [
        {
          $lookup: {
            from: "customers",
            localField: "customerId",
            foreignField: "_id",
            as: "customer",
          },
        },
        { $unwind: "$customer" },
        {
          $lookup: {
            from: "products",
            localField: "productId",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
        { $match: match },
      ];
  
      // Search by note and customer name
      if (search) {
        pipeline.push({
          $match: {
            $or: [
              { note: { $regex: search, $options: "i" } },
              { "customer.name": { $regex: search, $options: "i" } },
            ],
          },
        });
      }
  
      // Sort, paginate
      pipeline.push(
        { $sort: { date: -1 } },
        { $skip: (+page - 1) * +limit },
        { $limit: +limit }
      );
  
      const [transactions, countDocs] = await Promise.all([
        Transaction.aggregate(pipeline),
        Transaction.aggregate([
          ...pipeline.filter((stage) => !('$skip' in stage || '$limit' in stage)),
          { $count: "total" },
        ]),
      ]);
  
      const totalItems = countDocs[0]?.total || 0;
  
      res.json({
        data: transactions,
        currentPage: +page,
        totalPages: Math.ceil(totalItems / +limit),
        totalItems,
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
        .reduce((sum, t) => sum + t.amount, 0);

    const totalBuys = transactions
        .filter(t => t.type === 'buy')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

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