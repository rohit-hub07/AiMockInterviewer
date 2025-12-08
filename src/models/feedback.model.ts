import mongoose, { Schema } from "mongoose";

interface IFeedback extends Document {
  questions: Schema.Types.ObjectId;
  userAnswers: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const feedbackSchema = new mongoose.Schema<IFeedback>({
  questions: [
    {
      type: Schema.Types.ObjectId,
      ref: "Question",
    },
  ],
  userAnswers: [
    {
      type: Schema.Types.ObjectId,
      ref: "Answer",
    },
  ],
},{timestamps: true});

const Feedback = mongoose.models.feedbacks || mongoose.model<IFeedback>("feedbacks", feedbackSchema);

export default Feedback;