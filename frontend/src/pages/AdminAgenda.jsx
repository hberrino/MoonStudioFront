import { useEffect, useId, useRef, useState } from "react";
import "./admin-agenda.css";

const weekdays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const monthFormat = new Intl.DateTimeFormat("es-AR", { month: "long", year: "numeric" });
const dayFormat = new Intl.DateTimeFormat("es-AR", { dateStyle: "full" });
const shortDateFormat = new Intl.DateTimeFormat("es-AR", { dateStyle: "short" });

export default function AdminAgenda({ professional, turnos, error, onEstadoChange, onDeleteTurno }) {
  const [monthOffset, setMonthOffset] = useState(0);
  const [openView, setOpenView] = useState(null);
  const today = new Date();
  const todayKey = dateKey(today);
  const month = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstWeekday = (month.getDay() + 6) % 7;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const turnosByDay = new Map();
  const pastTurnos = [];

  for (const turno of turnos) {
    if (!professional || String(turno.id_profesional) !== String(professional.id)) continue;
    const day = String(turno.fecha).slice(0, 10);
    if (day < todayKey) {
      pastTurnos.push(turno);
    } else {
      const dayTurnos = turnosByDay.get(day) || [];
      dayTurnos.push(turno);
      turnosByDay.set(day, dayTurnos);
    }
  }

  const dayTurnos = (turnosByDay.get(openView) || []).sort((a, b) => a.hora.localeCompare(b.hora));
  pastTurnos.sort((a, b) => b.fecha.localeCompare(a.fecha) || b.hora.localeCompare(a.hora));

  return (
    <div className="mt-5">
      {!professional && <p className="mb-3 text-on-surface-variant">Elegí un profesional para ver su agenda.</p>}
      <div className={`admin-agenda${professional ? "" : " admin-agenda-locked"}`}>
        <div className="admin-agenda-header">
          <button aria-label="Mes anterior" disabled={!professional || monthOffset === 0}
            onClick={() => setMonthOffset((offset) => offset - 1)} type="button">‹</button>
          <h3 aria-live="polite">{monthFormat.format(month)}</h3>
          <button aria-label="Mes siguiente" disabled={!professional || monthOffset === 2}
            onClick={() => setMonthOffset((offset) => offset + 1)} type="button">›</button>
        </div>
        <div className="admin-agenda-grid">
          {weekdays.map((day) => <span className="admin-agenda-weekday" key={day}>{day}</span>)}
          {Array.from({ length: firstWeekday }, (_, index) => <span aria-hidden="true" key={`blank-${index}`} />)}
          {Array.from({ length: daysInMonth }, (_, index) => {
            const day = index + 1;
            const date = new Date(year, monthIndex, day);
            const key = dateKey(date);
            const appointments = turnosByDay.get(key) || [];
            const occupied = appointments.filter((turno) => turno.estado !== "cancelado").length;
            const label = `${dayFormat.format(date)}, ${occupied} ${occupied === 1 ? "turno activo" : "turnos activos"}`;

            return (
              <button
                aria-current={key === todayKey ? "date" : undefined}
                aria-label={appointments.length && !occupied ? `${label}, ver cancelados` : label}
                className={`admin-agenda-day${occupied ? " admin-agenda-day-booked" : ""}`}
                disabled={!appointments.length}
                key={key}
                onClick={() => setOpenView(key)}
                type="button"
              >
                {day}
                {appointments.length > 0 && <small>{occupied || "–"}</small>}
              </button>
            );
          })}
        </div>
      </div>
      <div className="admin-agenda-footer">
        {professional && <p className="admin-agenda-legend">Verde: día con turnos activos</p>}
        <button className="admin-agenda-history" disabled={!professional} onClick={() => setOpenView("past")} type="button">
          Ver turnos pasados
        </button>
      </div>

      {openView === "past" && (
        <AgendaDialog title={`Turnos pasados de ${professional.nombre}`} onClose={() => setOpenView(null)}>
          {pastTurnos.length ? (
            <ul className="admin-agenda-past">
              {pastTurnos.map((turno) => (
                <li key={turno.id}>
                  {shortDateFormat.format(new Date(`${String(turno.fecha).slice(0, 10)}T12:00:00`))}
                  {` · ${formatHours(turno)} · ${turno.nombre_cliente} · ${turno.servicio_nombre} · ${turno.estado}`}
                </li>
              ))}
            </ul>
          ) : <p>No hay turnos pasados.</p>}
        </AgendaDialog>
      )}
      {openView && openView !== "past" && (
        <AgendaDialog title={dayFormat.format(new Date(`${openView}T12:00:00`))} onClose={() => setOpenView(null)}>
          <p className="text-on-surface-variant">{professional.nombre}</p>
          {error && <p className="admin-error" role="alert">{error}</p>}
          <div className="admin-agenda-appointments">
            {dayTurnos.length ? dayTurnos.map((turno) => (
              <article className="admin-agenda-appointment" key={turno.id}>
                <div className="admin-turno-details">
                  <strong>{formatHours(turno)} · {turno.nombre_cliente}</strong>
                  <span>{turno.servicio_nombre}</span>
                  {turno.telefono_cliente && <span>{turno.telefono_cliente}</span>}
                  {turno.email_cliente && <span>{turno.email_cliente}</span>}
                </div>
                <div className="admin-turno-actions">
                  <label className="block">
                    <span className="form-label">Estado</span>
                    <select className="form-input form-input-boxed" value={turno.estado}
                      onChange={(event) => onEstadoChange(turno.id, event.target.value)}>
                      <option value="pendiente">Pendiente</option>
                      <option value="confirmado">Confirmado</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                  </label>
                  <button className="admin-danger-button admin-compact-button" onClick={() => onDeleteTurno(turno)} type="button">
                    Liberar turno
                  </button>
                </div>
              </article>
            )) : <p>No quedan turnos para este día.</p>}
          </div>
        </AgendaDialog>
      )}
    </div>
  );
}

function AgendaDialog({ title, children, onClose }) {
  const dialogRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog aria-labelledby={titleId} className="admin-agenda-dialog" onClose={onClose} ref={dialogRef}>
      <div className="admin-agenda-dialog-header">
        <h3 id={titleId}>{title}</h3>
        <form method="dialog">
          <button className="button-secondary" type="submit">Cerrar</button>
        </form>
      </div>
      {children}
    </dialog>
  );
}

function dateKey(date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function formatHours(turno) {
  const start = String(turno.hora).slice(0, 5);
  const end = turno.hora_fin ? ` a ${String(turno.hora_fin).slice(0, 5)}` : "";
  return `${start}${end} hs`;
}
