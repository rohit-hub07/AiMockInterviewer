import express from "express";
import { createInterviewSession, endInterviewSession } from "../controllers/interview.controller.js";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";

const interviewSession = express.Router();

interviewSession.post("/create",isLoggedIn, createInterviewSession);
interviewSession.post("/end",isLoggedIn, endInterviewSession);

export default interviewSession;