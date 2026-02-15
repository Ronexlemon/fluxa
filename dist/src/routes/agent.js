"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const agent_controller_1 = require("../controller/agent_controller");
const router = (0, express_1.Router)();
router.post("/agents", agent_controller_1.AgentMcpcontroller);
exports.default = router;
