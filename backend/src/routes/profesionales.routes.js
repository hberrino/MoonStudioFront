import { Router } from "express";
import {
  getProfesional,
  getProfesionalServicios,
  getProfesionales,
  getProfesionalesAdmin,
  postProfesional,
  putProfesional,
  putProfesionalEmail,
  putProfesionalServicios,
  removeProfesional,
} from "../controllers/profesionales.controller.js";
import { requireAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", getProfesionales);
router.get("/admin", requireAdmin, getProfesionalesAdmin);
router.get("/:id", getProfesional);
router.get("/:id/servicios", getProfesionalServicios);
router.post("/", requireAdmin, postProfesional);
router.put("/:id", requireAdmin, putProfesional);
router.patch("/:id/email", requireAdmin, putProfesionalEmail);
router.delete("/:id", requireAdmin, removeProfesional);
router.put("/:id/servicios", requireAdmin, putProfesionalServicios);

export default router;
