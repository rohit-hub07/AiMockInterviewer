import type { Request, Response } from "express"
import InterviewSession from "../models/interviewsession.model.js";


export const updateInterviewSession = async (req: Request, res: Response) => {
  try {
    const { interviewId } = req.body;
    const { questionCount, title } = req.body;
    const userId = req.userId;

    if (!interviewId) {
      return res.status(404).json({
        message: "Interview id not found!",
        success: false,
      })
    }

    const updateData: any = {};
    if (questionCount !== undefined) updateData.questionCount = questionCount;
    if (title !== undefined) updateData.title = title;

    await InterviewSession.findByIdAndUpdate(interviewId, updateData);

    return res.status(200).json({
      message: "Interview updated successfully!",
      success: true,
    })
  } catch (error: any) {
    console.log("Error updating interview session: ", error.message);
    return res.status(500).json({
      message: error.message || "Something went wrong!",
      success: false,
    })
  }
}

export const createInterviewSession = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const interview = await InterviewSession.create({
      userId: userId,
      startedAt: new Date(),
    })
    if (!interview) {
      return res.status(500).json({
        message: "Something went wrong-can't create interview session!",
        success: false,
      })
    }
    return res.status(201).json({
      message: "Session created successfully!",
      success: true,
      interviewId: interview._id.toString(),
    })
  } catch (error: any) {
    console.log("Error creating interview session: ", error.message);
    return res.status(500).json({
      message: error.message || "Something went wrong!",
      success: false,
    })
  }
}

export const endInterviewSession = async (req: Request, res: Response) => {
  try {
    const { interviewId } = req.body;
    if (!interviewId) {
      return res.status(404).json({
        message: "Interview id not found!",
        success: false,
      })
    }
    await InterviewSession.findByIdAndUpdate(interviewId, {
      endedAt: new Date()
    });

    return res.status(200).json({
      message: "Interview Ended successfully!",
      success: true,
    })
  } catch (error: any) {
    console.log("Error ending interview session: ", error.message);
    return res.status(500).json({
      message: error.message || "Something went wrong!",
      success: false,
    })
  }
}

export const getUserInterviews = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    const sessions = await InterviewSession.find({ userId })
      .sort({ startedAt: -1 });

    const interviews = sessions.map((session: any) => {
      const durationMinutes = session.endedAt
        ? Math.round((new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime()) / 60000)
        : undefined;

      return {
        id: session._id.toString(),
        title: session.title || `Interview Session`,
        status: session.endedAt ? 'completed' : 'in-progress',
        date: session.startedAt.toISOString(),
        score: session.score,
        questions: session.questionCount || 0,
        duration: durationMinutes ? `${durationMinutes} min` : undefined,
      };
    });

    return res.status(200).json({
      success: true,
      interviews,
    });
  } catch (error: any) {
    console.log("Error fetching user interviews: ", error.message);
    return res.status(500).json({
      message: error.message || "Something went wrong!",
      success: false,
    })
  }
}