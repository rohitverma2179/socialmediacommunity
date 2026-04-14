import mongoose from "mongoose";
import "dotenv/config";
const connectDB = async (): Promise<void> => {
  // const uri = process.env.MONGO_URI || process.env.DATABASE_URL;
  const uri = process.env.MONGO_URI ;
  if (!uri) {
    console.error("❌ DB Error: MONGO_URI or DATABASE_URL not defined in .env");  
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected to: ${uri.split("@")[1] || "localhost"}`);
  } catch (error) {
    console.error("❌ DB Error:", error);
    process.exit(1);
  }
};

export default connectDB;