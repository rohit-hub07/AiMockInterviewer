import { GoogleGenAI } from "@google/genai";


const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API as string });

export const generateQues = async (resumeText: string, difficulty : string = "hard") => {
  const prompt = `
    You are an AI technical interviewer.

    Based on this resume, generate 10 interview questions:
    ${resumeText}

    and keep the difficulty level: ${difficulty}

    Return questions as JSON like this:
    [
      { "id": 1, "question": "..." }
    ]
  `;
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });
  // const response = result.response;
  console.log("response from gemini: ",response.text);
  return response.text;
}
