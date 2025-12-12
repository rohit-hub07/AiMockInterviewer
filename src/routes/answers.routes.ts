import express from "express";
import { answersController } from "../controllers/answers.controller.js";

const answerRouter = express.Router();

answerRouter.post("/useranswer", answersController);

export default answerRouter;