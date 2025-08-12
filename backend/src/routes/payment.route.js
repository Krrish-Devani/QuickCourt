import { Router } from 'express';
import {
  getPayments,
  createOrder,
  verifyPayment
} from '../controllers/payment.controller.js';
import { checkAuthMiddleware } from '../middleware/checkAuthMiddleware.js';

const router = Router();

// All payment routes require authentication
router.use(checkAuthMiddleware);

router.get("/", getPayments);
router.post("/create-order", createOrder);
router.post("/verify", verifyPayment);

export default router;