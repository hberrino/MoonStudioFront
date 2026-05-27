import { Router } from "express";
import {
  getProfesional,
  getProfesionalServicios,
  getProfesionales,
  postProfesional,
  putProfesional,
  putProfesionalServicios,
  removeProfesional,
} from "../controllers/profesionales.controller.js";
import { requireAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", getProfesionales);
router.get("/:id", getProfesional);
router.get("/:id/servicios", getProfesionalServicios);
router.post("/", requireAdmin, postProfesional);
router.put("/:id", requireAdmin, putProfesional);
router.delete("/:id", requireAdmin, removeProfesional);
router.put("/:id/servicios", requireAdmin, putProfesionalServicios);

export default router;
