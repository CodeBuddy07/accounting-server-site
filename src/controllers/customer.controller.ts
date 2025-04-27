import { NextFunction, Request, RequestHandler, Response } from 'express';
import Customer, { ICustomer } from '../models/customer.model';
import transactionModel, { ITransaction } from '../models/transaction.model';
import mongoose from 'mongoose';
import { sendSMS } from '../utils/smsSender';


// Add a new customer
export const addCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, phone, note, balance } = req.body;
        const newCustomer: ICustomer = new Customer({ name, phone, note, balance });
        await newCustomer.save();
        res.status(201).json(newCustomer);
    } catch (error) {
        next(error);
    }
};

// Edit a customer
export const editCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { id } = req.params;
        const { name, phone, note } = req.body;
        const customer = await Customer.findByIdAndUpdate(
            id,
            { name, phone, note },
            { new: true }
        );
        if (customer) {
            res.json(customer);
        } else {
            res.status(404).json({ message: 'Customer not found' });
        }
    } catch (error) {
        next(error);
    }
};

// Delete a customer
export const deleteCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        await Customer.findByIdAndDelete(id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

// Get all customers with search and pagination
export const getCustomers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { page = 1, limit = 10, search = "" } = req.query;

        const query = {
            $or: [
                { name: { $regex: search, $options: "i" } },
                { phone: { $regex: search, $options: "i" } },
                { note: { $regex: search, $options: "i" } },
            ],
        };

        const customers = await Customer.find(query)
            .skip((+page - 1) * +limit)
            .limit(+limit)
            .sort({ createdAt: -1 });

        const total = await Customer.countDocuments(query);

        res.json({
            data: customers,
            currentPage: +page,
            totalPages: Math.ceil(total / +limit),
            total,
        });
    } catch (error) {
        next(error)
    }
};

export const getCustomerReport: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { customerId } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const pageNumber = parseInt(page as string);
        const limitNumber = parseInt(limit as string);

        // Validate customerId
        if (!mongoose.Types.ObjectId.isValid(customerId)) {
            res.status(400).json({ message: 'Invalid customer ID' });
            return 
        }

        // Get customer info
        const customer = await Customer.findById(customerId).lean() as ICustomer;
        if (!customer) {
            res.status(404).json({ message: 'Customer not found' });
            return 
        }

        // Build base query for transactions
        const transactionQuery: any = {
            $or: [
                { customerId: new mongoose.Types.ObjectId(customerId) },
                { customerName: customer.name }
            ]
        };

        // Count total transactions for pagination
        const totalTransactions = await transactionModel.countDocuments(transactionQuery);

        // Get paginated transactions
        const transactions = await transactionModel.find(transactionQuery)
            .populate('products.productId', 'name')
            .sort({ date: -1 })
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber)
            .lean() as ITransaction[];

        // Calculate totals (from all transactions, not just current page)
        const allTransactions = await transactionModel.find(transactionQuery).lean();
        
        let totalPurchases = 0;
        let totalSales = 0;
        let amountOwed = 0;
        let amountDue = 0;

        allTransactions.forEach(txn => {
            if (txn.type === 'buy') totalPurchases += txn.total;
            if (txn.type === 'sell') totalSales += txn.total;
            
            if (txn.paymentType === 'due') {
                if (txn.type === 'sell') amountDue += txn.total;
                else amountOwed += txn.total;
            }
        });

        // Process transactions for current page
        const processedTransactions = transactions.map(txn => ({
            id: txn._id.toString(),
            type: txn.type,
            date: txn.date.toISOString(),
            amount: txn.total * (txn.type === 'sell' ? 1 : -1),
            paymentType: txn.paymentType || 'cash',
            products: txn.products?.map(product => ({
                name: (product.productId as any)?.name || 'Unknown Product',
                price: product.price,
                quantity: product.quantity
            })),
            note: txn.note
        }));

        // Prepare the report with pagination info
        const report = {
            customerInfo: {
                name: customer.name,
                contact: customer.phone,
                balance: customer.balance || 0
            },
            totals: {
                totalPurchases,
                totalSales,
                amountOwed,
                amountDue
            },
            transactions: {
                data: processedTransactions,
                pagination: {
                    currentPage: pageNumber,
                    totalPages: Math.ceil(totalTransactions / limitNumber),
                    totalTransactions,
                    transactionsPerPage: limitNumber
                }
            }
        };

        res.json(report);
    } catch (error) {
        next(error);
    }
};


// Adjust balance based on transaction
export const adjustCustomerBalance = async (
    transaction: ITransaction,
    session: mongoose.ClientSession
  ) => {
    if (!transaction.customerId) return;
  
    const customer = await Customer.findById(transaction.customerId).session(session);
    if (!customer) return;
  
    const total = transaction.total;
  
    switch (transaction.type) {
      case 'sell':
        customer.balance = (customer.balance ?? 0) - total;
        break;
      case 'buy':
        customer.balance = (customer.balance ?? 0) + total;
        break;
      case 'receivable':
        customer.balance = (customer.balance ?? 0) + total;
        break;
      case 'due':
        customer.balance = (customer.balance ?? 0) - total;
        break;
      default:
        break;
    }
  
    await customer.save({ session });
  };
  

// Reverse the balance based on the old transaction
export const reverseCustomerBalance = async (transaction: ITransaction, session: mongoose.ClientSession) => {
    if (!transaction.customerId) return;
  
    const customer = await Customer.findById(transaction.customerId).session(session);
    if (!customer) return;
  
    const total = transaction.total;
  
    switch (transaction.type) {
      case 'sell':
        customer.balance = (customer.balance ?? 0) + total;
        break;
      case 'buy':
        customer.balance = (customer.balance ?? 0) - total;
        break;
      case 'receivable':
        customer.balance = (customer.balance ?? 0) - total;
        break;
      case 'due':
        customer.balance = (customer.balance ?? 0) + total;
        break;
      default:
        break;
    }
  
    await customer.save({ session });
  };
  
  

// Edit a customer
export const sendSMSToCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { id } = req.params;
        const { message } = req.body;
        if (!message) {
            res.status(400).json({ message: 'Message is required' });
            return;
        }
        const customer = await Customer.findById(id);

        if (customer) {
            const x = message.replace('{name}', customer.name).replace('{balance}', customer.balance!.toString());
            await sendSMS(customer.phone, x);
            res.json({ message: 'SMS sent successfully' });
        } else {
            res.status(404).json({ message: 'Customer not found' });
        }
    } catch (error) {
        next(error);
    }
};

