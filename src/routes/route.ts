import { Router } from "express";
import accountWallets from "./wallet";
import x402Prot from "./payment"
import webhook from "./webhook"
import Mcpagent from "./agent"
import { AgentMcpcontroller } from "../controller/agent_controller";


const router = Router();

router.use("/account", accountWallets);
router.use("/x402", x402Prot);
router.use("/endpoint",webhook)
router.use("/agents",AgentMcpcontroller)

export default router;
