import express from "express";
import { answersController } from "../controllers/answers.controller.js";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";

const answerRouter = express.Router();

answerRouter.post("/user-answer",isLoggedIn, answersController);

export default answerRouter;