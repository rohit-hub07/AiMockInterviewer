import mongoose, { Schema } from "mongoose";

interface IAnswer extends Document{
  answers: string[];
  userId: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const answerSchema = new mongoose.Schema<IAnswer>({
  answers: [
    {
      type: String,
    },
  ],
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  }
}, {timestamps: true})

const Answer = mongoose.models.answers || mongoose.model<IAnswer>("answers", answerSchema);

export default Answer;