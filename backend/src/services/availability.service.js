import { findBloqueosByProfesionalAndDate } from "../models/bloqueo.model.js";
import {
  findDisponibilidadForDate,
  findTurnosOcupados,
} from "../models/disponibilidad.model.js";

export async function getAvailableTimes(idProfesional, fecha) {
  const diaSemana = getDiaSemana(fecha);
  const disponibilidad = await findDisponibilidadForDate(idProfesional, diaSemana);

  if (!disponibilidad) return [];

  const horarios = buildHorarios(disponibilidad);
  const [ocupados, bloqueos] = await Promise.all([
    findTurnosOcupados(idProfesional, fecha),
    findBloqueosByProfesionalAndDate(idProfesional, fecha),
  ]);

  return horarios.filter(
    (horario) => !isHorarioOccupied(horario, ocupados) && !isHorarioBlocked(horario, bloqueos),
  );
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
