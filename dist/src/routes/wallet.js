"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const wallet_controller_1 = require("../controller/wallet_controller");
const router = (0, express_1.Router)();
router.post("/create", wallet_controller_1.CreateAccount);
router.post("/details", wallet_controller_1.getAccountdetails);
exports.default = router;
