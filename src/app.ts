import express from "express";
import cors from "cors";
import globalRouter from "./app/router/router";
import notFound from "./app/middleware/notFound";
import globalErrorHandler from "./app/middleware/globalErrorHandler";

const app = express();

app.use(express.json());
app.use(cors());

// route
app.use("/api", globalRouter);

// API route not found
app.all("*", notFound);

// Global error handler
app.use(globalErrorHandler);

export default app;
