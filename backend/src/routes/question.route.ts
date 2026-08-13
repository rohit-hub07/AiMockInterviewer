import express from "express";
import { createQuestion } from "../controllers/createquestion.controller.js";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";

const questionRouter = express.Router();

questionRouter.post("/create-question", isLoggedIn, createQuestion);

export default questionRouter;