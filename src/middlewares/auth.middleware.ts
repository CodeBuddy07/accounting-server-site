import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import Admin from "../models/admin.model";
import config from "../config";

// Extend the Request interface to include the admin property
declare global {
  namespace Express {
    interface Request {
      admin?: InstanceType<typeof Admin>;
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from cookies
    const token = req.cookies.token;

    if (!token) {
      const error = new Error("No token, authorization denied");
      (error as any).statusCode = 401; // Attach status code to the error
      throw error;
    }

    // Verify token
    const decoded: any = jwt.verify(token, config.jwt.secret as string);

    // Find admin by ID from the token
    const admin = await Admin.findOne({email: decoded.email});
    if (!admin) {
      const error = new Error("Invalid token");
      (error as any).statusCode = 401;
      throw error;
    }

    // Attach admin to the request object
    req.admin = admin;
    next();
  } catch (error) {
    next(error); // Pass error to the global error handler
  }
};