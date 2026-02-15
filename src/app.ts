import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import morgan from "morgan";
import routes from "./routes/route";

const app: Application = express();

/* ---------- Middlewares ---------- */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

/* ---------- Health Check ---------- */
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

/* ---------- API Routes ---------- */
app.use("/api", routes);

/* ---------- 404 Handler (AFTER routes) ---------- */
app.use((_req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

// /* ---------- Global Error Handler ---------- */
// app.use(
//   (
//     err: Error,
//     _req: Request,
//     res: Response,
//     _next: NextFunction
//   ) => {
//     console.error(err);
//     res.status(500).json({ message: "Internal server error" });
//   }
// );

export default app;
