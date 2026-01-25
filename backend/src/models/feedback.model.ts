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
}, { timestamps: true });

const Feedback = mongoose.models.feedbacks || mongoose.model<IFeedback>("feedbacks", feedbackSchema);

export default Feedback;