import type { Request, Response } from "express"
import Answer from "../models/answers.schema.js";
import Question from "../models/question.model.js";
import Feedback from "../models/feedback.model.js";

export const feedBackController = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const answers = await Answer.find({ userId: userId });
    console.log("Answers inside of the feedback controller: ", answers);
    if (!answers) {
      return res.status(500).json({ message: "Can't find the user answers!", success: false })
    }
    const questions = await Question.find({ userId: userId })
    console.log("Questions inside of the feedback controller: ", questions)

    if (!questions) {
      return res.status(500).json({ message: "Can't find the questions!", success: false })
    }

    const feedBack = await Feedback.create({
      questions: questions?.questions,
      answers: answers?.answers
    })
    

  } catch (error) {

  }
}