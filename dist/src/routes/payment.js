"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_controller_1 = require("../controller/payment_controller");
const router = (0, express_1.Router)();
router.post("/Request", payment_controller_1.x40PaymentRequest);
exports.default = router;
