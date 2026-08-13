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
You are an extremely strict technical interviewer.

You will be given:
- An array of question objects
- An array of answer objects (each answer corresponds to a question)

CRITICAL RULES:
1. If an answer is missing, empty, or says "I don't know", treat it as a ZERO score for that question. DO NOT hallucinate or invent positive feedback for missing answers.
2. Do not assume content that is not explicitly written in the answer.
3. Only comment on what is actually present in the user's answers.
4. Be harsh and strict. A candidate who skips most questions should receive a very low score.
5. Partial or vague answers should receive partial credit at most.

Your task:
1. Evaluate ONLY the content that is actually present in the answers.
2. Assign an overall score out of 10.
3. Identify the user's key strengths based ONLY on real answers.
4. Identify the user's key weaknesses based ONLY on real answers.
5. Write a detailed feedback paragraph that is honest and strict.

Response format (STRICT — return only valid JSON, no extra text):

{
  "result": {
    "score": number,
    "strength": string,
    "weakness": string,
    "detailedFeedback": string
  },
  "strengths": [string],
  "improvements": [string]
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
