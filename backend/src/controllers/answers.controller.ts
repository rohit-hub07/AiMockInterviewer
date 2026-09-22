import type { Response, Request } from "express";
import Answer from "../models/answers.schema.js";
export const answersController = async (req: Request, res: Response) => {
  try {
    //here user answer is an array of objects
    const { userAnswer, interviewId } = req.body;
    console.log("useranswer: ", userAnswer )
    if (!userAnswer || !interviewId) {
      return res.status(404).json({
        message: "User answer or Interview id not found!",
        success: false,
      })
    }
    // const updatedUserAnswers = userAnswer.map((ans: any, idx: number) => ({
    //   id: typeof ans.id === "number" ? ans.id : idx+1,
    //   answer: ans.answer ?? ans.answers ?? "",
    // }))
    // console.log("User answers: ", updatedUserAnswers);
    const userId = req.userId;
    if (!userId) {
      return res.status(404).json({
        message: "User not found!",
        success: "false"
      })
    }
    // Upsert so re-submits / retries overwrite instead of creating duplicates,
    // and feedback always reads the latest answers for this interview.
    const answer = await Answer.findOneAndUpdate(
      { interviewId: interviewId as any, userId: userId as any },
      { answers: userAnswer, userId: userId, interviewId: interviewId },
      { new: true, upsert: true, runValidators: true }
    )
    if (!answer) {
      return res.status(500).json({
        message: "Error storing the answers!",
        success: false,
      })
    }
    return res.status(200).json({
      message: "Answers stored successfully",
      success: true,
      userAnswer: answer,
    })

  } catch (error: any) {
    console.log("Error storing the answer in DB: ", error.message);
    return res.status(500).json({
      message: error.message || "Something went wrong"
    })
  }
}