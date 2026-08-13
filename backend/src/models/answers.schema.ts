import mongoose, { Schema } from "mongoose";

interface IAnswer {
  answers: {
    id: number;
    answer: string;
  }[];
  userId: Schema.Types.ObjectId;
  interviewId: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const answerSchema = new mongoose.Schema<IAnswer>({
  answers: [
    {
      id: {
        type: Number
      },
      answer: String,
      isSkipped: {
        type: Boolean,
        default: false,
      },
    },
  ],
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  interviewId: {
    type: Schema.Types.ObjectId,
    ref: "InterviewSession"
  }
}, { timestamps: true })

const Answer = mongoose.models.Answer || mongoose.model<IAnswer>("Answer", answerSchema);

export default Answer;