import express from "express";
import { loginController, logoutController, registerUser, getCurrentUser } from "../controllers/user.controller.js";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginController);
userRouter.post("/logout", isLoggedIn, logoutController);
userRouter.get("/me", isLoggedIn, getCurrentUser);


export default userRouter;