export const cleanExtractedText = (text: string) => {
  return text
    .replace(/\r\n/g, "\n")        
    .replace(/\n{2,}/g, "\n")     
    .replace(/\s{2,}/g, " ")       
    .trim();
};