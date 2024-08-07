import express from "express";
import morgan from "morgan";
import { authRouter } from "./auth/route";
import { globalErrorHandler } from "./utils/globalErrorHandler";
import dotenv from "dotenv";
import cors from "cors";
import { handleUncaughtExceptions, handleUnhandledRejections } from "./utils/processErrorHandler";
import { Server } from "socket.io";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

handleUnhandledRejections();
handleUncaughtExceptions();

app.use(express.json());
app.use(
  cors({
    origin: "*",
  }),
);
app.use(morgan("dev"));
app.use("/auth", authRouter);
app.use(globalErrorHandler);

const server = app.listen(PORT, () => {
  console.log(`Listening to PORT ${PORT}`);
});

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log(`User ${socket.id} connected`);

  socket.on("message", (message, name) => {
    io.emit("message", `${name} said:  ${message} `);
  });
  socket.on("disconnect", () => {
    console.log(`User ${socket.id} disconnected`);
  });
});
