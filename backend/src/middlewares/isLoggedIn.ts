import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import type { NextFunction, Request, Response } from "express";


dotenv.config();
export const isLoggedIn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(404).json({
        message: "Please login!",
        success: false,
      })
    }
    console.log("Token inside of the isLoggedIn: ", token);
    const decode = jwt.verify(token, process.env.JWT_SECRET as string) as jwt.JwtPayload;
    console.log("decoded :", decode);
    req.userId = decode.userId;
    next();
  } catch (error: any) {
    console.log("Error inside of the isLoggedIn: ", error.message);
    return res.status(500).json({
      message: "Something went wrong!",
      success: false,
    })
  }
}