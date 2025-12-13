import mongoose, { Document, Schema } from "mongoose";


interface QuestionItem {
  id: number;
  question: string;
}

interface IQuestion extends Document {
  questions: QuestionItem[];
  difficulty: string;
  userId: Schema.Types.ObjectId;
  interviewId: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const questionSchema = new mongoose.Schema<IQuestion>({
  questions: [
    {
      id: { type: Number, required: true },
      question: { type: String, required: true },
    },
  ],
  difficulty: {
    type: String,
    default: "hard",
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  interviewId: {
    type: Schema.Types.ObjectId,
    ref: "InterviewSession"
  }
}, { timestamps: true });

const Question = mongoose.models.Question || mongoose.model<IQuestion>("Question", questionSchema);

export default Question;