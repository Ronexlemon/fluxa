import { Router } from "express";
import accountWallets from "./wallet";
import x402Prot from "./payment"
import webhook from "./webhook"
import Mcpagent from "./agent"


const router = Router();

router.use("/account", accountWallets);
router.use("/x402", x402Prot);
router.use("/endpoint",webhook)
router.use("/mcp",Mcpagent)

export default router;
