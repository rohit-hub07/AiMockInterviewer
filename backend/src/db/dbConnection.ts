import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

type dbConnectionType = () => Promise<void>;


export const dbConnection: dbConnectionType = async () => {
  await mongoose.connect(process.env.DB_URL || "mongodb url is undefine").then(() => console.log("Connection successful!")).catch((err) => console.log("Error connecting to db: " + err));
}