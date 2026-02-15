import { Router } from "express";
import { AgentMcpcontroller } from "../controller/agent_controller";

const router = Router();

router.post("/agent", AgentMcpcontroller);


export default router;
