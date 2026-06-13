const API_URL = import.meta.env.VITE_API_URL || "/api";

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("moon_admin_token");
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 204) return null;

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(data?.message || "No se pudo completar la solicitud");
    error.status = response.status;
    throw error;
  }

  return data;
}

export const api = {
  login: (payload) =>
    apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getServicios: () => apiFetch("/servicios"),
  createServicio: (payload) =>
    apiFetch("/servicios", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateServicio: (id, payload) =>
    apiFetch(`/servicios/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  deleteServicio: (id) =>
    apiFetch(`/servicios/${id}`, {
      method: "DELETE",
    }),
  getProfesionales: () => apiFetch("/profesionales"),
  createProfesional: (payload) =>
    apiFetch("/profesionales", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  deleteProfesional: (id) =>
    apiFetch(`/profesionales/${id}`, {
      method: "DELETE",
    }),
  getProfesionalServicios: (id) => apiFetch(`/profesionales/${id}/servicios`),
  updateProfesionalServicios: (id, servicioIds) =>
    apiFetch(`/profesionales/${id}/servicios`, {
      method: "PUT",
      body: JSON.stringify({ servicioIds }),
    }),
  getDisponibilidadProfesional: (id) => apiFetch(`/disponibilidad/profesionales/${id}`),
  updateDisponibilidadProfesional: (id, payload) =>
    apiFetch(`/disponibilidad/profesionales/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  deleteDisponibilidadProfesional: (id, diaSemana) =>
    apiFetch(`/disponibilidad/profesionales/${id}/${diaSemana}`, {
      method: "DELETE",
    }),
  getHorariosDisponibles: (id, fecha) =>
    apiFetch(`/disponibilidad/profesionales/${id}/horarios?fecha=${fecha}`),
  getBloqueosProfesional: (id) => apiFetch(`/bloqueos/profesionales/${id}`),
  createBloqueoProfesional: (id, payload) =>
    apiFetch(`/bloqueos/profesionales/${id}`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  deleteBloqueo: (id) =>
    apiFetch(`/bloqueos/${id}`, {
      method: "DELETE",
    }),
  createTurno: (payload) =>
    apiFetch("/turnos", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getTurnos: () => apiFetch("/turnos"),
  updateTurnoEstado: (id, estado) =>
    apiFetch(`/turnos/${id}/estado`, {
      method: "PATCH",
      body: JSON.stringify({ estado }),
    }),
  deleteTurnosByProfesional: (id) =>
    apiFetch(`/turnos/profesional/${id}`, {
      method: "DELETE",
    }),
};
