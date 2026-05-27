import { Router } from "express";
import {
  getTurno,
  getTurnos,
  patchTurnoEstado,
  postTurno,
  removeTurno,
  removeTurnosByProfesional,
} from "../controllers/turnos.controller.js";
import { requireAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", postTurno);
router.get("/", requireAdmin, getTurnos);
router.get("/:id", requireAdmin, getTurno);
router.patch("/:id/estado", requireAdmin, patchTurnoEstado);
router.delete("/profesional/:idProfesional", requireAdmin, removeTurnosByProfesional);
router.delete("/:id", requireAdmin, removeTurno);

export default router;
