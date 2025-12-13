import { Router } from "express";
import upload from "../middlewares/multer.middleware.js";
import { uploadFile } from "../controllers/file.controller.js";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";

const router = Router();

router.post("/upload",isLoggedIn, upload.single("file"), uploadFile);

export default router;
