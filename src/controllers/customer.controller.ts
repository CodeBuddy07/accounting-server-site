import { NextFunction, Request, Response } from 'express';
import Customer, { ICustomer } from '../models/customer.model';
import { ITransaction } from '../models/transaction.model';


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


// Adjust balance based on transaction
export const adjustCustomerBalance = async (transaction: ITransaction) => {
    if (!transaction.customerId) return;

    const customer = await Customer.findById(transaction.customerId);
    if (!customer) return;

    const total = transaction.total;

    switch (transaction.type) {
        case 'sell':
            // Customer bought something → owes you → balance goes more negative
            customer.balance = (customer.balance ?? 0) - total;
            break;

        case 'buy':
            // You bought something from customer → you owe them → balance goes more positive
            customer.balance = (customer.balance ?? 0) + total;
            break;

        case 'receivable':
            // Customer pays you → reduces their due → balance increases (less negative)
            customer.balance = (customer.balance ?? 0) + total;
            break;

        case 'due':
            // You pay customer → reduces your due → balance decreases (less positive)
            customer.balance = (customer.balance ?? 0) - total;
            break;

        default:
            break;
    }

    await customer.save();
};

