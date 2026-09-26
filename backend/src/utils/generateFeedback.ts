import { GoogleGenAI } from "@google/genai";
import { Schema } from "mongoose";

interface QTypes{
  id: number | string;
  question: string
}

interface ATypes{
  id: number | string;
  answer: string;
  isSkipped?: boolean;
}

interface feedback{
  questions:QTypes[];
  userAnswers: ATypes[];
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API as string });

export const generateFeedback = async (feedback: feedback) => {
  // Pair each question with its corresponding answer by index/id.
  // This was the root-cause bug: the old prompt never included the
  // actual Q&A, so Gemini hallucinated generic feedback.
  const qaPairs = (feedback.questions || []).map((q, idx) => {
    const a = (feedback.userAnswers || [])[idx];
    const answerText = (a?.answer || "").trim();
    return {
      questionNumber: idx + 1,
      question: q.question,
      answer: answerText.length > 0 ? answerText : "[NO ANSWER PROVIDED]",
      skipped: a?.isSkipped === true || answerText.length === 0,
    };
  });

  const qaText = qaPairs
    .map((p) => `Q${p.questionNumber}: ${p.question}\nA${p.questionNumber}: ${p.answer}`)
    .join("\n\n");

  const prompt = `
You are an extremely strict technical interviewer.

You will be given ${qaPairs.length} interview questions with the candidate's answers below.
Evaluate ONLY what is actually written in the answers.

INTERVIEW DATA:
${qaText || "[No questions/answers provided]"}

CRITICAL RULES:
1. If an answer is missing, empty, "[NO ANSWER PROVIDED]", or says "I don't know", treat it as a ZERO for that question. DO NOT hallucinate or invent positive feedback for missing answers.
2. Do not assume content that is not explicitly written in the answer.
3. Only comment on what is actually present in the user's answers.
4. Be harsh and strict. A candidate who skips most questions should receive a very low score.
5. Partial or vague answers should receive partial credit at most.
6. Placeholder text like "Video answer recorded for question N" means NO transcribable content was captured — treat it as skipped / zero for that question.

Your task:
1. Evaluate ONLY the content that is actually present in the answers.
2. Assign an overall score from 0 to 100 (0 = nothing answered, 100 = all answers excellent).
3. Identify the user's key strengths based ONLY on real answers.
4. Identify the user's key weaknesses based ONLY on real answers.
5. Write a detailed feedback paragraph that is honest and strict, referencing specific questions by number.

Response format (STRICT — return only valid JSON, no extra text, no markdown fences):

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

  console.log("Sending to Gemini — questions:", feedback.questions?.length, "answers:", feedback.userAnswers?.length);

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });
  // const response = result.response;
  console.log("response from gemini: ",response.text);
  return response.text;
}
