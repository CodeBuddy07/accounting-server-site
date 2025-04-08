import { NextFunction, Request, RequestHandler, Response } from "express";
import Admin from "../models/admin.model";
import { comparePassword, generateToken, hashPassword, verifyToken, } from "../utils/JWT";
import config from "../config";
import { sendEmail } from "../utils/emailSender";

// Admin Login
export const loginAdmin: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    // Find admin by email
    const admin = await Admin.findOne({ email })

    // Check if admin exists and password is correct
    if (!admin || !(await comparePassword(password, admin.password))) {
      const error = new Error("Invalid credentials");
      (error as any).statusCode = 400; // Attach status code to the error
      throw error;

    }

    // Generate JWT token
    const token = generateToken({ email: admin.email });

    // Set token in cookies
    res.cookie("token", token, {
      httpOnly: true, // Prevents client-side JS from accessing the cookie
      secure: config.environment === "production", // Ensures cookies are only sent over HTTPS in production
      maxAge: 3600000, // 1 hour in milliseconds
      sameSite: 'none',
    });

    // Send response
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    next(error); // Pass error to the global error handler
  }
};



// Change Password
export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // Find admin by ID (assuming req.admin.id is set by auth middleware)
    const admin = await Admin.findById(req.admin?.email);

    // Check if admin exists and old password is correct
    if (!admin || !(await comparePassword(oldPassword, admin.password))) {
      const error = new Error("Incorrect old password");
      (error as any).statusCode = 400;
      throw error;
    }

    // Hash the new password and save
    admin.password = await hashPassword(newPassword);
    await admin.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    next(error); // Pass error to the global error handler
  }
};



// Forgot Password (Generate Reset Token)
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    // Find admin by email
    const admin = await Admin.findOne({ email });

    // Check if admin exists
    if (!admin) {
      const error = new Error("Admin not found");
      (error as any).statusCode = 400;
      throw error;
    }

    // Generate reset token (expires in 15 minutes)
    const resetToken = generateToken({ email: admin.email }, "15m");

    const resetUrl = `${config.clientSite}/reset-password/${resetToken}`;

    // Email content
    const subject = 'Password Reset Request';
    const message = `
      <p>You requested to reset your password. Please use the link below:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>If you didn't request this, you can ignore this email.</p>
    `;

    // Send the email
    await sendEmail({
      to: email,
      subject,
      html: message,
    });

    // In a real-world app, send this token via email
    res.status(200).json({ message: "Reset Email sent." });
  } catch (error) {
    next(error); // Pass error to the global error handler
  }
};


// Reset Password
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { resetToken, newPassword } = req.body;

    // Verify the reset token
    const decoded: any = verifyToken(resetToken);

    // Find admin by ID from the token
    const admin = await Admin.findOne({ email: decoded.email });
    if (!admin) {
      const error = new Error("Invalid token");
      (error as any).statusCode = 400;
      throw error;
    }

    // Hash the new password and save
    admin.password = await hashPassword(newPassword);
    await admin.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    next(error); // Pass error to the global error handler
  }
};

export const logout = (req: Request, res: Response, next: NextFunction) => {
  try {

    res.clearCookie("token");

    // Send a success response
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    next(error);
  }
};

export const Auth = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Send a success response
    res.status(200).json({ success: true, message: "Verification successful", admin: req.admin });
  } catch (error) {
    next(error);
  }
};
