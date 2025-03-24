import mongoose from "mongoose";
import config from ".";

const connectDB = async () => {
  try {
    await mongoose.connect(config.databaseUrl);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
};

export default connectDB;
