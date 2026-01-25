import express from "express";
import { createInterviewSession, endInterviewSession, getUserInterviews } from "../controllers/interview.controller.js";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";

const interviewSession = express.Router();

interviewSession.post("/create", isLoggedIn, createInterviewSession);
interviewSession.post("/end", isLoggedIn, endInterviewSession);
interviewSession.get("/user", isLoggedIn, getUserInterviews);

export default interviewSession;