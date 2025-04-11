import { NextFunction, Request, Response } from 'express';
import Customer, { ICustomer } from '../models/customer.model';
import { ITransaction } from '../models/transaction.model';


// Add a new customer
export const addCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, phone, note, dues, receivable } = req.body;
        const newCustomer: ICustomer = new Customer({ name, phone, note, dues, receivable });
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


// Adjust dues/receivables when a transaction is made
export const adjustDuesReceivables = async (transaction: ITransaction) => {
    if (transaction.customerId) {
        const customer = await Customer.findById(transaction.customerId);
        if (customer) {
            if (transaction.type === 'due') {
                customer.dues = (customer.dues || 0) - transaction.amount;
            } else if (transaction.type === 'receivable') {
                customer.receivable = (customer.receivable || 0) + transaction.amount;
            }
            await customer.save();
        }
    }
};