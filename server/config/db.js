const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
      autoIndex: false,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);

    // TEMPORARILY DISABLED to prevent crash - create indexes manually outside the app
    // console.log("Creating indexes...");
    // await conn.connection.db.collection("users").createIndex({ email: 1 }, { unique: true, background: true });
    // await conn.connection.db.collection("users").createIndex({ saIdNumber: 1 }, { unique: true, background: true });
    // await conn.connection.db.collection("transactions").createIndex({ user: 1, date: -1 }, { background: true });
    // console.log("All indexes created successfully");

  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;