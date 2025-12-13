import express from "express";
import { createQuestion } from "../controllers/createquestion.controller.js";

const questionRouter = express.Router();

questionRouter.post("/create-question", createQuestion);

export default questionRouter;