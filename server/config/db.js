const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("🔄 Connecting to MongoDB...");

    const uri = process.env.MONGODB_URI;

    console.log("URI loaded:", !!uri);
    console.log("Starts with mongodb+srv://:", uri?.startsWith("mongodb+srv://"));
    console.log("Contains port :27017:", uri?.includes(":27017"));
    console.log("URI length:", uri?.length);

    await mongoose.connect(uri);

    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:");
    console.error(error);
    throw error;
  }
};

module.exports = connectDB;