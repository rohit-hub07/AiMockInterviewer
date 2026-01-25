import type { Request, Response } from "express"
import Answer from "../models/answers.schema.js";
import Question from "../models/question.model.js";
import Feedback from "../models/feedback.model.js";
import { generateFeedback } from "../utils/generateFeedback.js";
import { cleanExtractedText } from "../utils/cleanText.js";


export const feedBackController = async (req: Request, res: Response) => {
  try {
    const { interviewId } = req.body;
    const userId = req.userId;
    if (!interviewId || !userId) {
      return res.status(404).json({
        message: "Interview id or user id is not found!",
        success: false,
      })
    }
    const answers = await Answer.findOne({ interviewId: interviewId } as any);

    console.log("answers from feedback controller: ", answers);

    if (!answers) {
      return res.status(500).json({ message: "Can't find the user answers!", success: false })
    }
    const questions = await Question.findOne({ interviewId } as any)

    console.log("Questions inside of the feedback controller: ", questions)

    if (!questions) {
      return res.status(500).json({ message: "Can't find the questions!", success: false })
    }

    const feedBack = await Feedback.create({
      interviewId: interviewId,
      questions: questions?.questions,
      userAnswers: answers?.answers
    });
    console.log("Feedback created: ", feedBack);
    const feedbackfromGemini = await generateFeedback(feedBack)
    // console.log("feedback: ",JSON.parse(feedbackfromGemini as string))
    const cleanedText = cleanExtractedText(feedbackfromGemini as string);

    const cleanedFeedback = cleanedText.replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    console.log("Feedback: ", cleanedFeedback);
    let parsed: any;
    try {
      parsed = JSON.parse(cleanedFeedback);
    } catch (error) {
      return res.status(400).json({
        message: "Conn't parse the feedback!",
        success: false,
      })
    }
    return res.status(200).json({
      message: "Feedback generated successfully",
      success: true,
      feedback: parsed
    })
  } catch (error: any) {
    console.log("Error inside of the feedback controller: ", error.message);
    return res.status(500).json({ message: error.message || "Something went wrong!", success: false })
  }
}

export const getFeedback = async (req: Request, res: Response) => {
  try {
    const { interviewId } = req.params;
    const userId = req.userId;

    if (!interviewId) {
      return res.status(404).json({
        message: "Interview id not found!",
        success: false,
      });
    }

    // Find feedback for this interview
    const feedback = await Feedback.findOne({ interviewId } as any);

    if (!feedback) {
      return res.status(404).json({
        message: "No feedback found for this interview",
        success: false,
      });
    }

    return res.status(200).json({
      success: true,
      id: feedback._id.toString(),
      questions: feedback.questions,
      userAnswers: feedback.userAnswers,
      createdAt: (feedback as any).createdAt,
    });
  } catch (error: any) {
    console.log("Error fetching feedback: ", error.message);
    return res.status(500).json({
      message: error.message || "Something went wrong!",
      success: false
    });
  }
} 