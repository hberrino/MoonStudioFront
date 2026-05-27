import { Router } from "express";
import {
  getBloqueosProfesional,
  postBloqueoProfesional,
  removeBloqueo,
} from "../controllers/bloqueos.controller.js";
import { requireAdmin } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/profesionales/:idProfesional", requireAdmin, getBloqueosProfesional);
router.post("/profesionales/:idProfesional", requireAdmin, postBloqueoProfesional);
router.delete("/:id", requireAdmin, removeBloqueo);

export default router;
