import multer from "multer";

// Use memory storage so files can be parsed in-memory
// and streamed to Cloudinary (no local uploads/ folder needed).
const storage = multer.memoryStorage();

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  // media types for future answer video/audio uploads
  "video/webm",
  "video/mp4",
  "audio/webm",
  "audio/mpeg",
  "audio/wav",
  "image/jpeg",
  "image/png",
];

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Unsupported file type: ${file.mimetype}. Allowed: PDF, DOC, DOCX.`
      )
    );
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter,
});

export default upload;
