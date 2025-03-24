import { Request, Response } from 'express';
import Customer, { ICustomer } from '../models/customer.model';
import { ITransaction } from '../models/transaction.model';


// Add a new customer
export const addCustomer = async (req: Request, res: Response) => {
    const { name, phone, note, dues, receivable  } = req.body;
    const newCustomer: ICustomer = new Customer({ name, phone, note, dues, receivable });
    await newCustomer.save();
    res.status(201).json(newCustomer);
};

// Edit a customer
export const editCustomer = async (req: Request, res: Response) => {
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
};

// Delete a customer
export const deleteCustomer = async (req: Request, res: Response) => {
    const { id } = req.params;
    await Customer.findByIdAndDelete(id);
    res.status(204).send();
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