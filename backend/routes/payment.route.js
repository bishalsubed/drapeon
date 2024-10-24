import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { completePayment, initializeEsewa } from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/initialize-esewa", protectRoute, initializeEsewa);
router.get("/complete-payment", protectRoute, completePayment);

export default router;