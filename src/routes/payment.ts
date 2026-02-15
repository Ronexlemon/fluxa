import { Router } from "express";
import { x40PaymentRequest } from "../controller/payment_controller";

const router = Router();

router.post("/Request", x40PaymentRequest);


export default router;
