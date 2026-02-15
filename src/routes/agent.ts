import { Router } from "express";
import { AgentMcpcontroller } from "../controller/agent_controller";

const router = Router();

router.post("/mcp", AgentMcpcontroller);


export default router;
