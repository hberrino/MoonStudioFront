import {
  createTurno,
  deleteTurno,
  deleteTurnosByProfesional,
  findAllTurnos,
  findTurnoById,
  hasTurnoOverlap,
  updateTurnoEstado,
} from "../models/turno.model.js";
import { findProfesionalById, hasServicioAsignado } from "../models/profesional.model.js";
import { getAvailableTimes } from "../services/availability.service.js";
import { sendTurnoNotificationEmail } from "../services/email.service.js";
import {
  isValidClientName,
  isValidDate,
  isValidEmail,
  isValidPhone,
  isValidPositiveInteger,
  isValidTime,
  normalizeEmail,
  normalizePhone,
  sanitizeText,
} from "../utils/validation.js";

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

    const normalizedTurno = {
      nombreCliente: sanitizeText(nombreCliente),
      emailCliente: normalizeEmail(emailCliente),
      telefonoCliente: normalizePhone(telefonoCliente),
      idProfesional: Number(idProfesional),
      idServicio: Number(idServicio),
      fecha: sanitizeText(fecha),
      hora: sanitizeText(hora).slice(0, 5),
    };

    if (!isValidClientName(normalizedTurno.nombreCliente)) {
      return res.status(400).json({
        message:
          "Ingresa un nombre valido, sin numeros ni caracteres especiales.",
      });
    }

    if (!isValidEmail(normalizedTurno.emailCliente)) {
      return res.status(400).json({
        message: "Ingresa un correo valido de Gmail, Hotmail, Outlook, Live, Yahoo o iCloud.",
      });
    }

    if (!isValidPhone(normalizedTurno.telefonoCliente)) {
      return res.status(400).json({
        message: "Ingresa un telefono valido, solo numeros, entre 7 y 12 digitos.",
      });
    }

    if (
      !isValidPositiveInteger(normalizedTurno.idProfesional) ||
      !isValidPositiveInteger(normalizedTurno.idServicio) ||
      !isValidDate(normalizedTurno.fecha) ||
      !isValidTime(normalizedTurno.hora)
    ) {
      return res.status(400).json({ message: "Los datos del turno no son validos." });
    }

    const servicioAsignado = await hasServicioAsignado(
      normalizedTurno.idProfesional,
      normalizedTurno.idServicio,
    );

    if (!servicioAsignado) {
      return res.status(400).json({
        message: "El servicio no esta asignado a la profesional seleccionada.",
      });
    }

    const horariosDisponibles = await getAvailableTimes(
      normalizedTurno.idProfesional,
      normalizedTurno.fecha,
    );

    if (!horariosDisponibles.includes(normalizedTurno.hora)) {
      return res.status(409).json({
        message: "El horario seleccionado ya no esta disponible.",
      });
    }

    const turno = await createTurno(normalizedTurno);

    findProfesionalById(normalizedTurno.idProfesional)
      .then((profesional) => sendTurnoNotificationEmail({ profesional, turno }))
      .catch((emailError) => {
        console.error("No se pudo enviar el aviso de turno:", emailError);
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

export async function postTurnoManual(req, res, next) {
  try {
    const { nombreCliente, idProfesional, idServicio, fecha, hora, horaFin } = req.body;
    const normalizedTurno = {
      nombreCliente: sanitizeText(nombreCliente),
      emailCliente: "",
      telefonoCliente: "",
      idProfesional: Number(idProfesional),
      idServicio: Number(idServicio),
      fecha: sanitizeText(fecha),
      hora: sanitizeText(hora).slice(0, 5),
      horaFin: sanitizeText(horaFin).slice(0, 5),
    };

    if (!isValidClientName(normalizedTurno.nombreCliente)) {
      return res.status(400).json({
        message: "Ingresa un nombre valido, sin numeros ni caracteres especiales.",
      });
    }

    if (
      !isValidPositiveInteger(normalizedTurno.idProfesional) ||
      !isValidPositiveInteger(normalizedTurno.idServicio) ||
      !isValidDate(normalizedTurno.fecha) ||
      !isValidTime(normalizedTurno.hora) ||
      !isValidTime(normalizedTurno.horaFin) ||
      normalizedTurno.horaFin <= normalizedTurno.hora
    ) {
      return res.status(400).json({ message: "Los datos del turno no son validos." });
    }

    const servicioAsignado = await hasServicioAsignado(
      normalizedTurno.idProfesional,
      normalizedTurno.idServicio,
    );

    if (!servicioAsignado) {
      return res.status(400).json({
        message: "El servicio no esta asignado a la profesional seleccionada.",
      });
    }

    const turnoSuperpuesto = await hasTurnoOverlap(
      normalizedTurno.idProfesional,
      normalizedTurno.fecha,
      normalizedTurno.hora,
      normalizedTurno.horaFin,
    );

    if (turnoSuperpuesto) {
      return res.status(409).json({
        message: "Ese rango se superpone con otro turno de la profesional.",
      });
    }

    const turno = await createTurno(normalizedTurno);
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
