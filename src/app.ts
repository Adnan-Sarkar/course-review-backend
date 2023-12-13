import express, { Request, Response } from "express";
import cors from "cors";
import globalRouter from "./app/router/router";
import notFound from "./app/middleware/notFound";
import globalErrorHandler from "./app/middleware/globalErrorHandler";

const app = express();

app.use(express.json());
app.use(cors());

// route
app.use("/api", globalRouter);

app.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the course review backend API",
    details: "For API details, visit /api/courses",
    documentation:
      "For detailed documentation, visit: https://github.com/Porgramming-Hero-web-course/l2b2a3-course-review-Adnan-Sarkar",
  });
});

// API route not found
app.all("*", notFound);

// Global error handler
app.use(globalErrorHandler);

export default app;
