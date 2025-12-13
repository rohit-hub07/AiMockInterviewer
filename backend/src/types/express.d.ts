import * as express from "express";

declare global {
  namespace Express {
    interface Request {
      file?: Multer.File;
    }
  }
}


declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}