import { Router } from "express";
import { AgentMcpcontroller } from "../controller/agent_controller";
import { settlePaymentController } from "../controller/agent_controller";

const router = Router();

router.post("/agent", AgentMcpcontroller);
router.post("/x402", settlePaymentController);


export default router;
