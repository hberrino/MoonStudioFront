import { Router } from "express";
import {
  getDisponibilidadProfesional,
  getCalendarioDisponibilidad,
  getHorariosDisponibles,
  putDisponibilidadProfesional,
  removeDisponibilidadProfesional,
} from "../controllers/disponibilidad.controller.js";
import { requireAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/profesionales/:idProfesional", requireAdmin, getDisponibilidadProfesional);
router.put("/profesionales/:idProfesional", requireAdmin, putDisponibilidadProfesional);
router.delete(
  "/profesionales/:idProfesional/:diaSemana",
  requireAdmin,
  removeDisponibilidadProfesional,
);
router.get("/profesionales/:idProfesional/horarios", getHorariosDisponibles);
router.get("/profesionales/:idProfesional/calendario", getCalendarioDisponibilidad);

export default router;
