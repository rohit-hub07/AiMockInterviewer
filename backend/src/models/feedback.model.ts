import mongoose, { Schema } from "mongoose";

interface QTypes {
  id: string;
  question: string
}

interface ATypes {
  id: string;
  answer: string
}

interface IFeedback extends Document {
  interviewId: Schema.Types.ObjectId;
  questions: QTypes[];
  userAnswers: ATypes[];
  overallScore?: number;
  strengths?: string[];
  improvements?: string[];
  detailedFeedback?: string;
  createdAt: Date;
  updatedAt: Date;
}

const feedbackSchema = new mongoose.Schema<IFeedback>({
  interviewId: {
    type: Schema.Types.ObjectId,
    ref: "sessions",
    required: true,
  },
  questions: [
    {
      id: { type: Number, required: true },
      question: { type: String, required: true },
    },
  ],
  userAnswers: [
    {
      id: { type: Number },
      answer: { type: String },
    },
  ],
  overallScore: {
    type: Number,
    min: 0,
    max: 100,
  },
  strengths: [
    {
      type: String,
    },
  ],
  improvements: [
    {
      type: String,
    },
  ],
  detailedFeedback: {
    type: String,
  },
}, { timestamps: true });

const Feedback = mongoose.models.feedbacks || mongoose.model<IFeedback>("feedbacks", feedbackSchema);

export default Feedback;