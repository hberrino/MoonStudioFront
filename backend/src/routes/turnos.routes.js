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
import { rateLimit } from "../middlewares/rateLimit.middleware.js";

const router = Router();

router.post("/", rateLimit({ limit: 8, windowMs: 15 * 60 * 1000 }), postTurno);
router.get("/", requireAdmin, getTurnos);
router.get("/:id", requireAdmin, getTurno);
router.patch("/:id/estado", requireAdmin, patchTurnoEstado);
router.delete("/profesional/:idProfesional", requireAdmin, removeTurnosByProfesional);
router.delete("/:id", requireAdmin, removeTurno);

export default router;
