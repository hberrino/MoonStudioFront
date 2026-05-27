import {
  createServicio,
  deleteServicio,
  findAllServicios,
  findServicioById,
  updateServicio,
} from "../models/servicio.model.js";

export async function getServicios(_req, res, next) {
  try {
    const servicios = await findAllServicios();
    res.json(servicios);
  } catch (error) {
    next(error);
  }
}

export async function getServicio(req, res, next) {
  try {
    const servicio = await findServicioById(req.params.id);

    if (!servicio) {
      return res.status(404).json({ message: "Servicio not found" });
    }

    return res.json(servicio);
  } catch (error) {
    return next(error);
  }
}

export async function postServicio(req, res, next) {
  try {
    const { nombre, precio = null } = req.body;

    if (!nombre) {
      return res.status(400).json({ message: "nombre is required" });
    }

    const servicio = await createServicio({ nombre, precio });
    return res.status(201).json(servicio);
  } catch (error) {
    return next(error);
  }
}

export async function putServicio(req, res, next) {
  try {
    const { nombre, precio = null } = req.body;

    if (!nombre) {
      return res.status(400).json({ message: "nombre is required" });
    }

    const servicio = await updateServicio(req.params.id, { nombre, precio });

    if (!servicio) {
      return res.status(404).json({ message: "Servicio not found" });
    }

    return res.json(servicio);
  } catch (error) {
    return next(error);
  }
}

export async function removeServicio(req, res, next) {
  try {
    const deleted = await deleteServicio(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Servicio not found" });
    }

    return res.status(204).send();
  } catch (error) {
    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(409).json({
        message:
          "No se puede eliminar este servicio porque tiene turnos asociados. Podés conservarlo para mantener el historial.",
      });
    }

    return next(error);
  }
}
