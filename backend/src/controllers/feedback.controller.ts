import type { Request, Response } from "express"
import Answer from "../models/answers.schema.js";
import Question from "../models/question.model.js";
import Feedback from "../models/feedback.model.js";
import InterviewSession from "../models/interviewsession.model.js";
import { generateFeedback } from "../utils/generateFeedback.js";
import { cleanExtractedText } from "../utils/cleanText.js";
import { calculateLocalScore } from "../utils/scoreCalculator.js";


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

    const answersDoc = await Answer.findOne({ interviewId: interviewId } as any);
    const questionsDoc = await Question.findOne({ interviewId } as any);

    const totalQuestions = questionsDoc?.questions?.length || 0;
    const answers = answersDoc?.answers || [];

    const localScore = calculateLocalScore(totalQuestions, answers);

    if (!answersDoc || !questionsDoc) {
      await InterviewSession.findByIdAndUpdate(interviewId, {
        score: localScore.score,
        endedAt: new Date(),
      });

      return res.status(200).json({
        message: "Feedback generated successfully",
        success: true,
        feedback: {
          result: {
            score: localScore.score,
            strength: "Completed the interview session",
            weakness: "No questions or answers were recorded",
            detailedFeedback: `You answered ${localScore.answeredCount} out of ${totalQuestions} questions.`,
          },
          strengths: localScore.answeredCount > 0 ? ["Completed the interview"] : [],
          improvements: localScore.skippedCount > 0 ? ["Try to answer more questions"] : [],
        }
      });
    }

    const feedBack = await Feedback.create({
      interviewId: interviewId,
      questions: questionsDoc.questions,
      userAnswers: answersDoc.answers
    });

    let geminiParsed: any = null;
    try {
      const feedbackfromGemini = await generateFeedback(feedBack);
      const cleanedText = cleanExtractedText(feedbackfromGemini as string);

      const cleanedFeedback = cleanedText.replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      try {
        geminiParsed = JSON.parse(cleanedFeedback);
      } catch {
        geminiParsed = null;
      }
    } catch (geminiError) {
      console.error("Gemini feedback generation failed:", geminiError);
    }

    const geminiScore = geminiParsed?.result?.score ?? geminiParsed?.overallScore ?? null;
    const finalScore = localScore.score;

    const strengths = geminiParsed?.strengths && geminiParsed.strengths.length > 0
      ? geminiParsed.strengths
      : localScore.answeredCount > 0
        ? ["Completed the interview session"]
        : [];

    const improvements = geminiParsed?.improvements && geminiParsed.improvements.length > 0
      ? geminiParsed.improvements
      : localScore.skippedCount > 0
        ? ["Try to answer more questions next time"]
        : [];

    const detailedFeedback = geminiParsed?.result?.detailedFeedback
      || geminiParsed?.detailedFeedback
      || `You answered ${localScore.answeredCount} out of ${totalQuestions} questions. ${localScore.skippedCount > 0 ? `You skipped ${localScore.skippedCount} questions.` : "Great job answering all questions!"}`;

    const updatedFeedback = await Feedback.findByIdAndUpdate(feedBack._id, {
      overallScore: finalScore,
      strengths,
      improvements,
      detailedFeedback,
    });

    await InterviewSession.findByIdAndUpdate(interviewId, {
      score: finalScore,
      endedAt: new Date(),
    });

    return res.status(200).json({
      message: "Feedback generated successfully",
      success: true,
      feedback: {
        result: {
          score: finalScore,
          strength: strengths[0] || "",
          weakness: improvements[0] || "",
          detailedFeedback,
        },
        strengths,
        improvements,
        overallScore: finalScore,
      }
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
      overallScore: feedback.overallScore,
      strengths: feedback.strengths,
      improvements: feedback.improvements,
      detailedFeedback: feedback.detailedFeedback,
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