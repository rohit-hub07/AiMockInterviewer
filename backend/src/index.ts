import dotenv from "dotenv";
import app from "./app.js";
import { dbConnection } from "./db/dbConnection.js";

dotenv.config();

const PORT = process.env.PORT || 8000;

dbConnection();

app.listen(PORT, () => {
  console.log(`App is listening to port: ${PORT}`);
});