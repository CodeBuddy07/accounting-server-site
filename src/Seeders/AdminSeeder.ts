import mongoose from "mongoose";
import bcrypt from "bcrypt";
import Admin from "../models/admin.model"; // Adjust the path as needed
import dotenv from "dotenv";
import config from "../config";

// Load environment variables
dotenv.config();

// Admin data to seed
const adminData = {
  email: "admin@example.com",
  password: "admin123", // Plain text password (will be hashed)
};

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(config.databaseUrl as string);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1); // Exit the process if connection fails
  }
};

// Seed the admin user
const seedAdmin = async () => {
  try {
    // Connect to the database
    await connectDB();

    // Check if an admin already exists
    const existingAdmin = await Admin.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log("Admin already exists:", existingAdmin.email);
      process.exit(0); // Exit if admin already exists
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminData.password, salt);

    // Create the admin user
    const admin = new Admin({
      email: adminData.email,
      password: hashedPassword,
    });

    // Save the admin to the database
    await admin.save();

    console.log("Admin seeded successfully:", admin.email);
    process.exit(0); // Exit after seeding
  } catch (error) {
    console.error("Error seeding admin:", error);
    process.exit(1); // Exit with error
  }
};

// Run the seeder
seedAdmin();