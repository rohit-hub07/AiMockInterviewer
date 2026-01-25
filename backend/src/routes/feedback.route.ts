import express from "express";
import { feedBackController, getFeedback } from "../controllers/feedback.controller.js";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";

const feedbackRoute = express.Router();

feedbackRoute.post("/feedback", feedBackController);
feedbackRoute.get("/feedback/:interviewId", isLoggedIn, getFeedback);

export default feedbackRoute;