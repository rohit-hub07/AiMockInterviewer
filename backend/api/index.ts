import type { Request, Response } from "express";
import app from "../src/app.js";
import { dbConnection } from "../src/db/dbConnection.js";

let isConnected = false;

export default async function handler(req: Request, res: Response) {
  if (!isConnected) {
    try {
      await dbConnection();
      isConnected = true;
    } catch (err) {
      console.error("DB connection error:", err);
    }
  }
  return (app as any)(req, res);
}
