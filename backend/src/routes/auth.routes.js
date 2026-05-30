import { Router } from "express";
import { login } from "../controllers/auth.controller.js";
import { rateLimit } from "../middlewares/rateLimit.middleware.js";

const router = Router();

router.post("/login", rateLimit({ limit: 10, windowMs: 15 * 60 * 1000 }), login);

export default router;
