

// interface DashboardStats {
//   totalSales: number;
//   totalPurchases: number;
//   totalExpenses: number;
//   totalDue: number;
//   totalReceivable: number;
//   netCashFlow: number;
//   customerCount: number;
//   productCount: number;
//   topSellingProducts: TopSellingProduct[];
//   topCustomers: TopCustomer[];
//   monthlyTrend: MonthlyTrend[];
//   inventoryValue: number;
//   profitMargin: number;
//   recentTransactions: ITransaction[];
// }

import { NextFunction, Request, Response } from "express";
import transactionModel from "../models/transaction.model";
import customerModel from "../models/customer.model";
import productModel from "../models/product.model";

// interface TopSellingProduct {
//   _id: string;
//   name: string;
//   totalQuantity: number;
//   totalSales: number;
// }

// interface TopCustomer {
//   _id: string;
//   name: string;
//   totalSpent: number;
//   count: number;
// }

// interface MonthlyTrend {
//   month: string;
//   total: number;
// }

// interface DailySales {
//   _id: string;
//   total: number;
//   count: number;
// }

// Get all dashboard statistics
export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Date filters (optional)


    // 1. Total Sales Amount
    const totalSales = await transactionModel.aggregate<{ _id: null; total: number }>([
      { $match: {  type: 'sell' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    // 2. Total Purchase Amount
    const totalPurchases = await transactionModel.aggregate<{ _id: null; total: number }>([
      { $match: { type: 'buy' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    // 3. Total Expenses
    const totalExpenses = await transactionModel.aggregate<{ _id: null; total: number }>([
      { $match: {  type: 'expense' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    // 4. Total Due Amount
    const totalDue = await transactionModel.aggregate<{ _id: null; total: number }>([
      { $match: {  paymentType: 'due' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    // 5. Total Receivable Amount
    const totalReceivable = await transactionModel.aggregate<{ _id: null; total: number }>([
      { $match: {  type: 'receivable' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    // 6. Net Cash Flow (Sales - Purchases - Expenses + Receivables)
    const netCashFlow =
      (totalSales[0]?.total || 0) -
      (totalPurchases[0]?.total || 0) -
      (totalExpenses[0]?.total || 0) +
      (totalReceivable[0]?.total || 0);

    // 7. Total Customers
    const customerCount = await customerModel.countDocuments();

    // 8. Total Products
    const productCount = await productModel.countDocuments();

    // 9. Top Selling Products
    const topSellingProducts = await transactionModel.aggregate([
      { $match: {  type: 'sell' } },
      { $unwind: '$products' },
      {
        $group: {
          _id: '$products.productId',
          totalQuantity: { $sum: '$products.quantity' },
          totalSales: { $sum: { $multiply: ['$products.price', '$products.quantity'] } }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      {
        $project: {
          _id: 1,
          name: '$productDetails.name',
          totalQuantity: 1,
          totalSales: 1
        }
      }
    ]);

    // 10. Top Customers
    const topCustomers = await transactionModel.aggregate([
      { $match: {  customerId: { $exists: true, $ne: null } } },
      {
        $group: {
          _id: '$customerId',
          totalSpent: { $sum: { $cond: [{ $eq: ['$type', 'sell'] }, '$total', 0] } },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'customers',
          localField: '_id',
          foreignField: '_id',
          as: 'customerDetails'
        }
      },
      { $unwind: '$customerDetails' },
      {
        $project: {
          _id: 1,
          name: '$customerDetails.name',
          totalSpent: 1,
          count: 1
        }
      }
    ]);

    // 11. Monthly Sales Trend (Last 6 months)
    const monthlyTrend = await transactionModel.aggregate([
      {
        $match: {
          type: 'sell',
          date: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          total: { $sum: '$total' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      {
        $project: {
          _id: 0,
          month: {
            $concat: [
              { $toString: '$_id.year' }, '-',
              { $toString: '$_id.month' }
            ]
          },
          total: 1
        }
      }
    ]);

    // 13. Current Inventory Value
    const inventoryValue = await productModel.aggregate<{ _id: null; totalValue: number }>([
      {
        $group: {
          _id: null,
          totalValue: {
            $sum: { $multiply: ['$buyingPrice', 1] } // Multiply by stock quantity when available
          }
        }
      }
    ]);

    // 14. Profit Margin (based on current data)
    const profitMargin = totalSales[0]?.total && totalPurchases[0]?.total
      ? ((totalSales[0].total - totalPurchases[0].total) / totalSales[0].total) * 100
      : 0;

    // 15. Recent Transactions
    const recentTransactions = await transactionModel.find()
      .sort({ date: -1 })
      .limit(5)
      .populate('customerId', 'name')
      .lean();

    // Return all statistics
    const stats = {
      totalSales: totalSales[0]?.total || 0,
      totalPurchases: totalPurchases[0]?.total || 0,
      totalExpenses: totalExpenses[0]?.total || 0,
      totalDue: totalDue[0]?.total || 0,
      totalReceivable: totalReceivable[0]?.total || 0,
      netCashFlow,
      customerCount,
      productCount,
      topSellingProducts,
      topCustomers,
      monthlyTrend,
      inventoryValue: inventoryValue[0]?.totalValue || 0,
      profitMargin: parseFloat(profitMargin.toFixed(2)),
      recentTransactions
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {

    next(error);
  }
};

