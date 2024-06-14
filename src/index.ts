import express from "express";
import morgan from "morgan";
import { authRouter } from "./auth/route";
import { globalErrorHandler } from "./utils/globalErrorHandler";
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
app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`Listening to PORT ${PORT}`);
});
