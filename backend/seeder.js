import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/Product.model.js";
import User from "./models/User.model.js";

dotenv.config();

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb+srv://laptechshop:Datnguyen04@cluster0.t0gyywh.mongodb.net/?appName=Cluster0";
    await mongoose.connect(mongoUri);
    console.log("MongoDB Connected");
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const importData = async () => {
  try {
    await connectDB();

    // Create a dummy admin user if not exists
    let admin = await User.findOne({ email: "admin@example.com" });
    if (!admin) {
      admin = await User.create({
        name: "Admin",
        email: "admin@example.com",
        password: "admin123", // Will be hashed
        isAdmin: true,
        isVerified: true,
      });
    }

    const sampleProducts = [
      {
        user: admin._id,
        name: "Dell Laptop",
        image: "/images/sample.jpg",
        description: "A great laptop",
        brand: "Dell",
        category: "Laptop",
        price: 1000,
        countInStock: 10,
        rating: 4.5,
        numReviews: 10,
      },
      {
        user: admin._id,
        name: "HP Desktop",
        image: "/images/sample.jpg",
        description: "Powerful desktop",
        brand: "HP",
        category: "Desktop",
        price: 800,
        countInStock: 5,
        rating: 4.0,
        numReviews: 5,
      },
    ];

    await Product.insertMany(sampleProducts);
    console.log("Data Imported!");
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

importData();