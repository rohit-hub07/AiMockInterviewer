import fs from "fs";
import mammoth from "mammoth";

export const extractTextFromBuffer = async (
  buffer: Buffer,
  mimeType: string
): Promise<string> => {
  if (mimeType === "application/pdf") {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });
    const data = await parser.getText();

    console.log("data inside of services: ", data);

    return data.text;
  }

  if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const data = await mammoth.extractRawText({ buffer });
    console.log("data inside of services: ", data);
    return data.value;
  }

  if (mimeType === "application/msword") {
    const data = await mammoth.extractRawText({ buffer });
    console.log("data inside of services: ", data);
    return data.value;
  }

  throw new Error("Unsupported file type");
};

export const extractTextFromFile = async (
  filePath: string,
  mimeType: string
): Promise<string> => {
  const buffer = fs.readFileSync(filePath);
  return extractTextFromBuffer(buffer, mimeType);
};

