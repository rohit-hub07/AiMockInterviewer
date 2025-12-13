import fs from "fs";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

export const extractTextFromFile = async (
  filePath: string,
  mimeType: string
): Promise<string> => {
  if (mimeType === "application/pdf") {
    const buffer = fs.readFileSync(filePath);
    const parser = new PDFParse({ data: buffer });
    const data = await parser.getText();
    
    console.log("data inside of services: ",data)

    return data.text;
  }

  if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const data = await mammoth.extractRawText({ path: filePath });
    console.log("data inside of services: ",data)
    return data.value;
  }

  throw new Error("Unsupported file type");
};

