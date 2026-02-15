"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const route_1 = __importDefault(require("./routes/route"));
const app = (0, express_1.default)();
/* ---------- Middlewares ---------- */
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)("dev"));
/* ---------- Health Check ---------- */
app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
});
/* ---------- API Routes ---------- */
app.use("/api", route_1.default);
/* ---------- 404 Handler (AFTER routes) ---------- */
app.use((_req, res) => {
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
exports.default = app;
