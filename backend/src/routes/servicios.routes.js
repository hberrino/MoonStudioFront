import { Router } from "express";
import {
  getServicio,
  getServicios,
  postServicio,
  putServicio,
  removeServicio,
} from "../controllers/servicios.controller.js";
import { requireAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", getServicios);
router.get("/:id", getServicio);
router.post("/", requireAdmin, postServicio);
router.put("/:id", requireAdmin, putServicio);
router.delete("/:id", requireAdmin, removeServicio);

export default router;
