import { GoogleGenAI } from "@google/genai";
import { Schema } from "mongoose";

interface QTypes{
  id: string;
  question: string
}

interface ATypes{
  id: string;
  answer: string
}

interface feedback{
  questions:QTypes[];
  userAnswers: ATypes[];
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API as string });

export const generateFeedback = async (feedback: feedback) => {
  const prompt = `
You are an expert technical interviewer.

You will be given:
- An array of question objects
- An array of answer objects (each answer corresponds to a question)

Your task:
1. Evaluate the user's answers based on correctness, clarity, depth, and relevance to the questions.
2. Assign an overall score out of 10.
3. Identify the user's key strengths.
4. Identify the user's key weaknesses.

Evaluation rules:
- Be concise and objective.
- Consider both technical accuracy and communication quality.
- If an answer is missing or incorrect, reflect it in the score.

Response format (STRICT — return only valid JSON, no extra text):

{
  "result": {
    "score": number, 
    "strength": string,
    "weakness": string
  }
}
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });
  // const response = result.response;
  console.log("response from gemini: ",response.text);
  return response.text;
}
