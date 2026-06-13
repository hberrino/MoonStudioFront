import {
  createProfesional,
  deleteProfesional,
  findAllProfesionales,
  findProfesionalById,
  findServiciosByProfesional,
  replaceServiciosForProfesional,
  updateProfesional,
} from "../models/profesional.model.js";
import { isValidClientName, isValidPositiveInteger, sanitizeText } from "../utils/validation.js";

export async function getProfesionales(_req, res, next) {
  try {
    const profesionales = await findAllProfesionales();
    res.json(profesionales);
  } catch (error) {
    next(error);
  }
}

export async function getProfesional(req, res, next) {
  try {
    const profesional = await findProfesionalById(req.params.id);

    if (!profesional) {
      return res.status(404).json({ message: "Profesional not found" });
    }

    return res.json(profesional);
  } catch (error) {
    return next(error);
  }
}

export async function postProfesional(req, res, next) {
  try {
    const nombre = sanitizeText(req.body.nombre, 80);

    if (!isValidClientName(nombre)) {
      return res.status(400).json({ message: "Ingresa un nombre de profesional valido." });
    }

    const profesional = await createProfesional({ nombre });
    return res.status(201).json(profesional);
  } catch (error) {
    return next(error);
  }
}

export async function putProfesional(req, res, next) {
  try {
    const nombre = sanitizeText(req.body.nombre, 80);

    if (!isValidClientName(nombre)) {
      return res.status(400).json({ message: "Ingresa un nombre de profesional valido." });
    }

    const profesional = await updateProfesional(req.params.id, { nombre });

    if (!profesional) {
      return res.status(404).json({ message: "Profesional not found" });
    }

    return res.json(profesional);
  } catch (error) {
    return next(error);
  }
}

export async function removeProfesional(req, res, next) {
  try {
    const deleted = await deleteProfesional(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Profesional not found" });
    }

    return res.status(204).send();
  } catch (error) {
    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(409).json({
        message:
          "No se puede eliminar este profesional porque tiene turnos asociados. Podés dejarlo sin disponibilidad o conservarlo para mantener el historial.",
      });
    }

    return next(error);
  }
}

export async function getProfesionalServicios(req, res, next) {
  try {
    const profesional = await findProfesionalById(req.params.id);

    if (!profesional) {
      return res.status(404).json({ message: "Profesional not found" });
    }

    const servicios = await findServiciosByProfesional(req.params.id);
    return res.json(servicios);
  } catch (error) {
    return next(error);
  }
}

export async function putProfesionalServicios(req, res, next) {
  try {
    const { servicioIds } = req.body;

    if (
      !Array.isArray(servicioIds) ||
      servicioIds.length > 100 ||
      servicioIds.some((id) => !isValidPositiveInteger(id))
    ) {
      return res.status(400).json({ message: "servicioIds must be an array" });
    }

    const uniqueServicioIds = [...new Set(servicioIds.map(Number))];

    const profesional = await findProfesionalById(req.params.id);

    if (!profesional) {
      return res.status(404).json({ message: "Profesional not found" });
    }

    const servicios = await replaceServiciosForProfesional(req.params.id, uniqueServicioIds);
    return res.json(servicios);
  } catch (error) {
    return next(error);
  }
}
