import User from "../models/user.models.js";
import type { Request, Response } from "express";
import { z } from "zod";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();


const registerUserType = z.object({
  username: z.string(),
  email: z.email("Invalid email format"),
  password: z.string().min(8),
})



export const registerUser = async (req: Request, res: Response) => {
  try {
    const result = registerUserType.safeParse(req.body);

    if (!result.success) {
      const firstError =
        result.error.issues[0]?.message || "Validation failed";

      return res.status(400).json({
        message: firstError,
        success: false,
      });
    }

    const { username, email, password } = registerUserType.parse(req.body);
    if (!username || !email || !password) {
      return res.status(400).json({
        message: "All fields are required!",
        success: false,
      })
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "User already exists!",
        success: false,
      })
    }
    //register the user
    const user = await User.create({
      username,
      email,
      password
    })
    if (!user) {
      return res.status(500).json({
        message: "Error occured while registering the user!",
        success: false,
      })
    }

    const tokenOptions = {
      userId: user._id,
      email: user.email
    }
    // create jwt secret
    const token = jwt.sign(tokenOptions, process.env.JWT_SECRET as string, { expiresIn: "1d" });


    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      maxAge: 24 * 60 * 60 * 3
    }
    //store user detail in the cookies
    res.cookie("token", token, cookieOptions);
    return res.status(201).json({
      message: "User registered successfully!",
      success: true,
      newUser: user,
    })
  } catch (error: any) {
    console.log("Error", error.message);
    const message =
      error?.issues?.[0]?.message ||
      "Something went wrong";
    return res.status(500).json({
      message: message,
      success: false,
    })
  }
}


const loginControllerType = z.object({
  email: z.email(),
  password: z.string()
})

export const loginController = async (req: Request, res: Response) => {
  try {
    const result = loginControllerType.safeParse(req.body);

    if (!result.success) {
      const firstError =
        result.error.issues[0]?.message || "Validation failed";

      return res.status(400).json({
        message: firstError,
        success: false,
      });
    }

    const { email, password } = loginControllerType.parse(req.body);
    if (!email || !password) {
      return res.status(400).json({
        message: "All fields are required!",
        success: false,
      })
    }
    const existingUser = await User.findOne({ email: email });
    if (!existingUser) {
      return res.status(404).json({
        message: "User doesn't exist!",
        success: false,
      })
    }
    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Email or password is incorrect!",
        success: false,
      })
    }

    const tokenOptions = {
      userId: existingUser._id,
      email: existingUser.email
    }
    // create jwt secret
    const token = jwt.sign(tokenOptions, process.env.JWT_SECRET as string, { expiresIn: "1d" });


    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      maxAge: 24 * 60 * 60 * 3
    }
    //store user detail in the cookies
    res.cookie("token", token, cookieOptions);

    return res.status(200).json({
      message: "User logged in successfully",
      success: true,
      user: existingUser,
    })
  } catch (error: any) {
    console.log("Error inside of login controller: ", error.message);
    return res.status(500).json({
      message: "Something went wrong",
      success: false,
    })
  }
}

export const logoutController = async (req: Request, res: Response) => {
  try {
    // const token = req.cookies?.token;
    res.clearCookie("token");
    return res.status(200).json({
      message: "Logout successfully",
      success: false,
    })
  } catch (error: any) {
    console.log("Error in logout: ", error.message);
    return res.status(500).json({
      message: "Something went wrong!",
      success: false,
    })
  }
}