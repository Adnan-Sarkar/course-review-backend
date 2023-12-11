import express from "express";
import cors from "cors";
import globalRouter from "./app/router/router";

const app = express();

app.use(express.json());
app.use(cors());

// route
app.use("/api", globalRouter);

export default app;
