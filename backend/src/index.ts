import express, { type Request, type Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import userRouter from "./routes/user.routes.js";
import fileRoutes from "./routes/file.route.js";
import { dbConnection } from "./db/dbConnection.js";
import answerRouter from "./routes/answers.routes.js";
import interviewSession from "./routes/createSession.routes..js";
import questionRouter from "./routes/question.route.js";
import feedbackRoute from "./routes/feedback.route.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT;
console.log("Port: ", PORT)

console.log("frontend url: ", process.env.FRONTEND_URL)

const corsOptions = {
  origin: (origin: any, callback: any) => {
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      "http://localhost:5173",
    ].filter(Boolean); // Remove undefined values

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Set-Cookie"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/", feedbackRoute);
app.use("/user", userRouter);
app.use("/files", fileRoutes);
app.use("/answer", answerRouter);
app.use("/", interviewSession);
app.use("/question", questionRouter);

app.get("/health", (req, res) => {
  res.send("This health route is working!")
})

dbConnection();

app.listen(PORT, () => {
  console.log(`App is listening to port: ${PORT}`);
})