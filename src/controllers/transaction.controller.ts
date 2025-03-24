import { Request, Response } from 'express';
import { adjustDuesReceivables } from './customer.controller';
import Transaction, { ITransaction } from '../models/transaction.model';


// Add a new transaction
export const addTransaction = async (req: Request, res: Response) => {
    const { type, customerId, productId, amount, note } = req.body;
    const newTransaction: ITransaction = new Transaction({
        type,
        customerId,
        productId,
        amount,
        note,
    });
    await newTransaction.save();

    // Adjust dues/receivables if the transaction involves a customer
    if (customerId) {
        await adjustDuesReceivables(newTransaction);
    }

    res.status(201).json(newTransaction);
};

// Get total calculations
export const getTotals = async (req: Request, res: Response) => {
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
};