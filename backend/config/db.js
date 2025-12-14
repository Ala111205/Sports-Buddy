import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.set("strictQuery", true);

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    setTimeout(connectDB, 5000); // retry instead of crashing
  }
};

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected. Reconnecting...");
  connectDB();
});

export default connectDB;