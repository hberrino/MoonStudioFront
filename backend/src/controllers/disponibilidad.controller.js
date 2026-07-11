import { findProfesionalById } from "../models/profesional.model.js";
import { findBloqueosByProfesionalAndDate } from "../models/bloqueo.model.js";
import {
  deleteDisponibilidad,
  findDisponibilidadByProfesional,
  findDisponibilidadForDate,
  findTurnosOcupados,
  upsertDisponibilidad,
} from "../models/disponibilidad.model.js";
import { isValidDate, isValidTime } from "../utils/validation.js";
import { getAvailableTimes } from "../services/availability.service.js";

const diaSemanaMin = 0;
const diaSemanaMax = 6;

export async function getDisponibilidadProfesional(req, res, next) {
  try {
    const profesional = await findProfesionalById(req.params.idProfesional);

    if (!profesional) {
      return res.status(404).json({ message: "Profesional not found" });
    }

    const disponibilidad = await findDisponibilidadByProfesional(req.params.idProfesional);
    return res.json(disponibilidad);
  } catch (error) {
    return next(error);
  }
}

export async function putDisponibilidadProfesional(req, res, next) {
  try {
    const { diaSemana, horaInicio, horaFin, intervaloMinutos = 30 } = req.body;
    const normalizedDiaSemana = Number(diaSemana);
    const normalizedIntervalo = Number(intervaloMinutos);

    if (
      Number.isNaN(normalizedDiaSemana) ||
      normalizedDiaSemana < diaSemanaMin ||
      normalizedDiaSemana > diaSemanaMax ||
      !isValidTime(horaInicio) ||
      !isValidTime(horaFin) ||
      Number.isNaN(normalizedIntervalo) ||
      normalizedIntervalo <= 0
    ) {
      return res.status(400).json({ message: "Invalid availability data" });
    }

    if (timeToMinutes(horaInicio) >= timeToMinutes(horaFin)) {
      return res.status(400).json({ message: "horaInicio must be before horaFin" });
    }

    const profesional = await findProfesionalById(req.params.idProfesional);

    if (!profesional) {
      return res.status(404).json({ message: "Profesional not found" });
    }

    const disponibilidad = await upsertDisponibilidad({
      idProfesional: req.params.idProfesional,
      diaSemana: normalizedDiaSemana,
      horaInicio,
      horaFin,
      intervaloMinutos: normalizedIntervalo,
    });

    return res.json(disponibilidad);
  } catch (error) {
    return next(error);
  }
}

export async function removeDisponibilidadProfesional(req, res, next) {
  try {
    const deleted = await deleteDisponibilidad(req.params.idProfesional, req.params.diaSemana);

    if (!deleted) {
      return res.status(404).json({ message: "Disponibilidad not found" });
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}

export async function getHorariosDisponibles(req, res, next) {
  try {
    const { fecha } = req.query;

    if (!isValidDate(fecha)) {
      return res.status(400).json({ message: "La fecha no es valida." });
    }

    const profesional = await findProfesionalById(req.params.idProfesional);

    if (!profesional) {
      return res.status(404).json({ message: "Profesional not found" });
    }

    const diaSemana = getDiaSemana(fecha);
    const disponibilidad = await findDisponibilidadForDate(req.params.idProfesional, diaSemana);

    if (!disponibilidad) {
      return res.json([]);
    }

    const horarios = buildHorarios(disponibilidad);
    const ocupados = await findTurnosOcupados(req.params.idProfesional, fecha);
    const bloqueos = await findBloqueosByProfesionalAndDate(req.params.idProfesional, fecha);
    const disponibles = horarios.filter(
      (horario) => !isHorarioOccupied(horario, ocupados) && !isHorarioBlocked(horario, bloqueos),
    );

    return res.json(disponibles);
  } catch (error) {
    return next(error);
  }
}

export async function getCalendarioDisponibilidad(req, res, next) {
  try {
    const { mes } = req.query;

    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(String(mes))) {
      return res.status(400).json({ message: "El mes no es valido." });
    }

    const profesional = await findProfesionalById(req.params.idProfesional);

    if (!profesional) {
      return res.status(404).json({ message: "Professional not found" });
    }

    const [year, month] = mes.split("-").map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const dates = Array.from({ length: daysInMonth }, (_item, index) =>
      `${year}-${String(month).padStart(2, "0")}-${String(index + 1).padStart(2, "0")}`,
    );
    const availability = await Promise.all(
      dates.map(async (fecha) => ({
        fecha,
        disponible: (await getAvailableTimes(req.params.idProfesional, fecha)).length > 0,
      })),
    );

    return res.json(availability);
  } catch (error) {
    return next(error);
  }
}

function isHorarioOccupied(horario, ocupados) {
  const horarioMinutes = timeToMinutes(horario);

  return ocupados.some((turno) => {
    const inicio = timeToMinutes(turno.hora);
    if (!turno.horaFin) return horarioMinutes === inicio;
    return horarioMinutes >= inicio && horarioMinutes < timeToMinutes(turno.horaFin);
  });
}

function buildHorarios({ hora_inicio: horaInicio, hora_fin: horaFin, intervalo_minutos: intervalo }) {
  const horarios = [];
  const end = timeToMinutes(horaFin);

  for (let current = timeToMinutes(horaInicio); current < end; current += intervalo) {
    horarios.push(minutesToTime(current));
  }

  return horarios;
}

function getDiaSemana(fecha) {
  const [year, month, day] = fecha.split("-").map(Number);
  return new Date(year, month - 1, day).getDay();
}

function timeToMinutes(value) {
  const [hours, minutes] = String(value).split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(value) {
  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function isHorarioBlocked(horario, bloqueos) {
  const horarioMinutes = timeToMinutes(horario);

  return bloqueos.some((bloqueo) => {
    const inicio = timeToMinutes(bloqueo.hora_inicio);
    const fin = timeToMinutes(bloqueo.hora_fin);
    return horarioMinutes >= inicio && horarioMinutes < fin;
  });
}
