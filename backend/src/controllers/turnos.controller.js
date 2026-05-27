import {
  createTurno,
  deleteTurno,
  deleteTurnosByProfesional,
  findAllTurnos,
  findTurnoById,
  updateTurnoEstado,
} from "../models/turno.model.js";

const estadosPermitidos = ["pendiente", "confirmado", "cancelado"];

export async function getTurnos(_req, res, next) {
  try {
    const turnos = await findAllTurnos();
    res.json(turnos);
  } catch (error) {
    next(error);
  }
}

export async function getTurno(req, res, next) {
  try {
    const turno = await findTurnoById(req.params.id);

    if (!turno) {
      return res.status(404).json({ message: "Turno not found" });
    }

    return res.json(turno);
  } catch (error) {
    return next(error);
  }
}

export async function postTurno(req, res, next) {
  try {
    const {
      nombreCliente,
      emailCliente,
      telefonoCliente,
      idProfesional,
      idServicio,
      fecha,
      hora,
    } = req.body;

    if (
      !nombreCliente ||
      !emailCliente ||
      !telefonoCliente ||
      !idProfesional ||
      !idServicio ||
      !fecha ||
      !hora
    ) {
      return res.status(400).json({ message: "Missing required turno fields" });
    }

    const turno = await createTurno({
      nombreCliente,
      emailCliente,
      telefonoCliente,
      idProfesional,
      idServicio,
      fecha,
      hora,
    });

    return res.status(201).json(turno);
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "La profesional ya tiene un turno reservado en ese horario.",
      });
    }

    return next(error);
  }
}

export async function patchTurnoEstado(req, res, next) {
  try {
    const { estado } = req.body;

    if (!estadosPermitidos.includes(estado)) {
      return res.status(400).json({ message: "Invalid estado" });
    }

    const turno = await updateTurnoEstado(req.params.id, estado);

    if (!turno) {
      return res.status(404).json({ message: "Turno not found" });
    }

    return res.json(turno);
  } catch (error) {
    return next(error);
  }
}

export async function removeTurno(req, res, next) {
  try {
    const deleted = await deleteTurno(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Turno not found" });
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}

export async function removeTurnosByProfesional(req, res, next) {
  try {
    const deletedCount = await deleteTurnosByProfesional(req.params.idProfesional);
    return res.json({ deletedCount });
  } catch (error) {
    return next(error);
  }
}
