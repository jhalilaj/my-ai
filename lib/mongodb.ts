import mongoose from "mongoose";


const MONGODB_URI = process.env.MONGODB_URI || ""; // MongoDB URI

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  await mongoose.connect(MONGODB_URI, { dbName: "AiTutors" });
};

export default connectDB;
