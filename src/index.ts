import express, { type Request, type Response } from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import userRouter from "./routes/user.routes.js";
import fileRoutes from "./routes/file.route.js";
import { dbConnection } from "./db/dbConnection.js";
import answerRouter from "./routes/answers.routes.js";
import interviewSession from "./routes/createSession.routes..js";
dotenv.config();

const app = express();
const PORT = process.env.PORT;
console.log("Port: ",PORT)

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

app.use("/user",userRouter);
app.use("/files", fileRoutes);
app.use("/answer", answerRouter);
app.use("/", interviewSession);

app.get("/health", (req,res) =>{
  res.send("This health route is working!")
})

dbConnection();

app.listen(PORT, () => {
  console.log(`App is listening to port: ${PORT}`);
})