import express from "express";
import morgan from "morgan";
import { authRouter } from "./auth/route";
import dotenv from "dotenv";
import {
  handleUncaughtExceptions,
  handleUnhandledRejections,
} from "./utils/errorHandler";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

handleUnhandledRejections();
handleUncaughtExceptions();

app.use(express.json());
app.use(morgan("dev"));
app.use("/auth", authRouter);

app.listen(PORT, () => {
  console.log(`Listening to PORT ${PORT}`);
});
