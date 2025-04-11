import { Request, Response, NextFunction } from 'express';
import Product, { IProduct } from '../models/product.model';

// Add a new product
export const addProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, buyingPrice, sellingPrice, note } = req.body;
    const newProduct: IProduct = new Product({ name, buyingPrice, sellingPrice, note });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    next(error);
  }
};

// Edit a product
export const editProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
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
  } catch (error) {
    next(error);
  }
};

// Delete a product
export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// Get Products with Pagination + Search
export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const query = search
      ? {
        $or: [
            { name: { $regex: search as string, $options: "i" } },
            { note: { $regex: search as string, $options: "i" } },
        ]
      }
      : {};

    const products = await Product.find(query)
      .skip((+page - 1) * +limit)
      .limit(+limit)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(query);

    res.json({
      data: products,
      total,
      page: +page,
      limit: +limit,
      totalPages: Math.ceil(total / +limit),
    });
  } catch (error) {
    next(error);
  }
};
