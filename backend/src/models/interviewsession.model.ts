import mongoose from "mongoose"
import { Schema } from "mongoose";


interface ISession {
  userId: string;
  startedAt: Date;
  endedAt?: Date;
}

const interviewSchema = new mongoose.Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  title: {
    type: String,
    default: "Interview Session",
  },
  startedAt: {
    type: Date,
  },
  endedAt: {
    type: Date,
  },
  score: {
    type: Number,
    min: 0,
    max: 100,
  },
  questionCount: {
    type: Number,
    default: 0,
  },
})

const InterviewSession = mongoose.models.sessions || mongoose.model<ISession>("sessions", interviewSchema);

export default InterviewSession;