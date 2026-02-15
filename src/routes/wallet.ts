import { Router } from "express";
import {
  CreateAccount,
  getAccountdetails,
} from "../controller/wallet_controller";

const router = Router();

router.post("/create", CreateAccount);
router.post("/details", getAccountdetails);

export default router;
