import mongoose, { Schema } from "mongoose";

interface IAnswers{
  id: number;
  answer: string;
}

interface IAnswer extends Document{
  answers: IAnswer[];
  userId: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const answerSchema = new mongoose.Schema<IAnswer>({
  answers: [
    {
     id:{
      type: Number
     },
     answer: String,
    },
  ],
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  }
}, {timestamps: true})

const Answer = mongoose.models.answers || mongoose.model<IAnswer>("answers", answerSchema);

export default Answer;