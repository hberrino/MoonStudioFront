import {
  createServicio,
  deleteServicio,
  findAllServicios,
  findServicioById,
  updateServicio,
} from "../models/servicio.model.js";
import {
  normalizeNullablePrice,
  normalizePriceType,
  sanitizeText,
} from "../utils/validation.js";

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
    const nombre = sanitizeText(req.body.nombre, 120);
    const pricePayload = normalizeServicePrice(req.body);

    if (!nombre || !pricePayload) {
      return res.status(400).json({ message: "Nombre o precio de servicio invalido." });
    }

    const servicio = await createServicio({ nombre, ...pricePayload });
    return res.status(201).json(servicio);
  } catch (error) {
    return next(error);
  }
}

export async function putServicio(req, res, next) {
  try {
    const nombre = sanitizeText(req.body.nombre, 120);
    const pricePayload = normalizeServicePrice(req.body);

    if (!nombre || !pricePayload) {
      return res.status(400).json({ message: "Nombre o precio de servicio invalido." });
    }

    const servicio = await updateServicio(req.params.id, { nombre, ...pricePayload });

    if (!servicio) {
      return res.status(404).json({ message: "Servicio not found" });
    }

    return res.json(servicio);
  } catch (error) {
    return next(error);
  }
}

function normalizeServicePrice(body) {
  const precioTipo = normalizePriceType(body.precio_tipo ?? body.precioTipo);
  const precioMin = normalizeNullablePrice(body.precio_min ?? body.precioMin ?? body.precio);
  const precioMax = normalizeNullablePrice(body.precio_max ?? body.precioMax);

  if (!precioTipo) return null;

  if (precioTipo === "consultar") {
    return { precioTipo, precioMin: null, precioMax: null };
  }

  if ((precioTipo === "fijo" || precioTipo === "desde") && precioMin !== null) {
    return { precioTipo, precioMin, precioMax: null };
  }

  if (precioTipo === "rango" && precioMin !== null && precioMax !== null && precioMax > precioMin) {
    return { precioTipo, precioMin, precioMax };
  }

  return null;
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
