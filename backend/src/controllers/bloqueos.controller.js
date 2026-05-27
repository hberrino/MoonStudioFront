import {
  createBloqueo,
  deleteBloqueo,
  findBloqueosByProfesional,
} from "../models/bloqueo.model.js";
import { findProfesionalById } from "../models/profesional.model.js";

export async function getBloqueosProfesional(req, res, next) {
  try {
    const profesional = await findProfesionalById(req.params.idProfesional);

    if (!profesional) {
      return res.status(404).json({ message: "Profesional not found" });
    }

    const bloqueos = await findBloqueosByProfesional(req.params.idProfesional);
    return res.json(bloqueos);
  } catch (error) {
    return next(error);
  }
}

export async function postBloqueoProfesional(req, res, next) {
  try {
    const { fecha, horaInicio, horaFin, motivo = null } = req.body;

    if (!fecha || !horaInicio || !horaFin) {
      return res.status(400).json({ message: "fecha, horaInicio and horaFin are required" });
    }

    if (timeToMinutes(horaInicio) >= timeToMinutes(horaFin)) {
      return res.status(400).json({ message: "horaInicio must be before horaFin" });
    }

    const profesional = await findProfesionalById(req.params.idProfesional);

    if (!profesional) {
      return res.status(404).json({ message: "Profesional not found" });
    }

    const bloqueo = await createBloqueo({
      idProfesional: req.params.idProfesional,
      fecha,
      horaInicio,
      horaFin,
      motivo,
    });

    return res.status(201).json(bloqueo);
  } catch (error) {
    return next(error);
  }
}

export async function removeBloqueo(req, res, next) {
  try {
    const deleted = await deleteBloqueo(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Bloqueo not found" });
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}

function timeToMinutes(value) {
  const [hours, minutes] = String(value).split(":").map(Number);
  return hours * 60 + minutes;
}
