import { Router } from "express";
import { webhook_receive } from "../controller/webhook_controller";

const router = Router();

router.post("/webhook", webhook_receive);


export default router;
