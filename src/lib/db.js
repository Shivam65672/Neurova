import mongoose from "mongoose";

let connectionPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return true;
  }

  if (connectionPromise) {
    await connectionPromise;
    return mongoose.connection.readyState === 1;
  }

  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    throw new Error("MONGODB_URI is not configured");
  }

  mongoose.connection.on("connected", () => {
    console.log("🟢 DB Connected");
  });

  mongoose.connection.on("error", (err) => {
    console.error("🔴 DB Connection Error:", err);
  });

  const normalizedUri = uri.replace(/\/$/, "");
  const finalUri = normalizedUri.includes("/Neurova")
    ? normalizedUri
    : `${normalizedUri}/Neurova`;

  connectionPromise = mongoose.connect(finalUri, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 10000,
    bufferCommands: false,
    dbName: "Neurova",
  });

  try {
    await connectionPromise;
    return true;
  } catch (err) {
    console.error("🔴 DB Connection Failed:", err);
    connectionPromise = null;
    return false;
  }
};

export default connectDB;