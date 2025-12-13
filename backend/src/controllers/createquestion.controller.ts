import type { Request, Response } from "express";
import Question from "../models/question.model.js";

export const createQuestion = async (req: Request, res: Response) => {
  try {
    const { questionObject, interviewId } = req.body;
    console.log("Questions: ", questionObject);
    if (!questionObject || !interviewId) {
      return res.status(404).json({
        message: "Question or interview id is not defined",
        success: false,
      })
    }
    const createdQuestions = await Question.create({
      questions: questionObject,
      userId: req.userId,
      interviewId: interviewId.toString(),
    })
    
    if (!createdQuestions) {
      return res.status(500).json({
        message: "Error creating questions",
        success: false,
      })
    }

    return res.status(201).json({
      message: "Questions created successfully",
      success: true,
      questions: createdQuestions,
    })

  } catch (error: any) {
    console.log("Error in the create question controller: ", error.message);
    return res.status(500).json({message: error.message || "Something went wrong!",success: false})
  }
}