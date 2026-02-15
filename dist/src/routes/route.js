"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const wallet_1 = __importDefault(require("./wallet"));
const payment_1 = __importDefault(require("./payment"));
const webhook_1 = __importDefault(require("./webhook"));
const agent_1 = __importDefault(require("./agent"));
const router = (0, express_1.Router)();
router.use("/account", wallet_1.default);
router.use("/x402", payment_1.default);
router.use("/endpoint", webhook_1.default);
router.use("/mcp", agent_1.default);
exports.default = router;
