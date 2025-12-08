import mongoose, { Document, Schema } from "mongoose";

interface QuestionItem {
  id: number;
  question: string;
}

interface IQuestion extends Document {
  questions: QuestionItem[];
  difficulty: string;
  userId: Schema.Types.ObjectId;
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
  }
}, { timestamps: true });

const Question = mongoose.models.questions || mongoose.model<IQuestion>("questions", questionSchema);

export default Question;