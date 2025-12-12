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
  startedAt: {
    type: Date,
  },
  endedAt: {
    type: Date,
  },
})

const InterviewSession = mongoose.models.sessions || mongoose.model<ISession>("sessions", interviewSchema);

export default InterviewSession;