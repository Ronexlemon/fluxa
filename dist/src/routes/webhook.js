"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const webhook_controller_1 = require("../controller/webhook_controller");
const router = (0, express_1.Router)();
router.post("/webhook", webhook_controller_1.webhook_receive);
exports.default = router;
