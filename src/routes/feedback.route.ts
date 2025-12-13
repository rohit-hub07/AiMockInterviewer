import express from "express";
import { feedBackController } from "../controllers/feedback.controller.js";

const feedbackRoute = express.Router();

feedbackRoute.post("/feedback", feedBackController);

export default feedbackRoute;