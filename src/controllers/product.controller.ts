import { Request, Response } from 'express';
import Product, { IProduct } from '../models/product.model';


// Add a new product
export const addProduct = async (req: Request, res: Response) => {
    const { name, buyingPrice, sellingPrice, note } = req.body;
    const newProduct: IProduct = new Product({ name, buyingPrice, sellingPrice, note });
    await newProduct.save();
    res.status(201).json(newProduct);
};

// Edit a product
export const editProduct = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, buyingPrice, sellingPrice, note } = req.body;
    const product = await Product.findByIdAndUpdate(
        id,
        { name, buyingPrice, sellingPrice, note },
        { new: true }
    );
    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
};

// Delete a product
export const deleteProduct = async (req: Request, res: Response) => {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    res.status(204).send();
};