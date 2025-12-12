import type { Request, Response } from "express";
import fs from "fs";
import { extractTextFromFile } from "../services/file.services.js";
import { cleanExtractedText } from "../utils/cleanText.js";
import { generateQues } from "../utils/generateQuestions.js";
import Question from "../models/question.model.js";

export const uploadFile = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const text = await extractTextFromFile(
      req.file.path,
      req.file.mimetype
    );

    fs.unlinkSync(req.file.path); // delete temp file
    const cleanedText = await cleanExtractedText(text);

    const result = await generateQues(cleanedText);

    if (!result) {
      return res.status(500).json({ message: "Failed to generate questions", success: false });
    }

    const cleanedQuestions = result.replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    console.log("Questions: ", cleanedQuestions);

    let parsedQuestions: any;
    try {
      parsedQuestions = JSON.parse(cleanedQuestions);
    } catch (parseError) {
      return res.status(400).json({ message: "Unable to parse generated questions", success: false });
    }

    if (!Array.isArray(parsedQuestions)) {
      return res.status(400).json({ message: "Generated questions are not in list form", success: false });
    }

    console.log("Parsed object: ",parsedQuestions);

    const questionObjects = parsedQuestions
      .map((q: any, idx: number) => ({
        id: typeof q.id === "number" ? q.id : idx + 1,
        question: q.question ?? q.questions ?? "",
      }))
      .filter((q: { question: string }) => q.question);

    if (!questionObjects.length) {
      return res.status(400).json({ message: "No valid questions generated", success: false });
    }

    const createdQuestions = await Question.create({
      questions: questionObjects,
      userId: req.userId,
    })
    
    if (!createdQuestions) {
      return res.status(500).json({
        message: "Error creating questions",
        success: false,
      })
    }

    // return res.status(200).json({ extractedText: cleanedText });

    return res.status(200).json({ message: "Question created successfully", success: true, questions: createdQuestions });

  } catch (error: any) {
    res.status(500).json({ message: error.message || "Something went wrong" });
  }
};
