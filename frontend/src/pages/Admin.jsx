import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api.js";

const emptyServiceForm = {
  nombre: "",
  seccion: "peluqueria",
  precioTipo: "consultar",
  precioMin: "",
  precioMax: "",
  idProfesionales: [],
};
const emptyProfessionalForm = { nombre: "" };
const emptyBlockForm = {
  fecha: "",
  horaInicio: "15:00",
  horaFin: "20:00",
  motivo: "",
};
const diasSemana = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miercoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sabado" },
];
const serviceSections = [
  { value: "peluqueria", label: "Peluquería" },
  { value: "cejas_pestanas", label: "Cejas y pestañas" },
  { value: "manos_unas", label: "Manos y uñas" },
  { value: "podoestetica", label: "Podoestética" },
];
const intervalos = [
  { value: 15, label: "15 min" },
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "1 hora" },
  { value: 90, label: "1 h 30 min" },
  { value: 120, label: "2 horas" },
  { value: 180, label: "3 horas" },
  { value: 240, label: "4 horas" },
  { value: 300, label: "5 horas" },
  { value: 360, label: "6 horas" },
  { value: 420, label: "7 horas" },
  { value: 480, label: "8 horas" },
];

export default function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem("moon_admin_token") || "");
  const [loginForm, setLoginForm] = useState({ nombre: "", password: "" });
  const [activeTab, setActiveTab] = useState("turnos");
  const [turnos, setTurnos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [profesionales, setProfesionales] = useState([]);
  const [servicioProfesionales, setServicioProfesionales] = useState({});
  const [disponibilidad, setDisponibilidad] = useState([]);
  const [bloqueos, setBloqueos] = useState([]);
  const [serviceForm, setServiceForm] = useState(emptyServiceForm);
  const [professionalForm, setProfessionalForm] = useState(emptyProfessionalForm);
  const [blockForm, setBlockForm] = useState(emptyBlockForm);
  const [turnosProfessionalFilter, setTurnosProfessionalFilter] = useState("");
  const [turnosTimeFilter, setTurnosTimeFilter] = useState("upcoming");
  const [availabilityForm, setAvailabilityForm] = useState({
    idProfesional: "",
    diaSemana: "1",
    horaInicio: "12:00",
    horaFin: "20:00",
    intervaloMinutos: "30",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const isLoggedIn = Boolean(token);

  const resetAdminSession = useCallback(() => {
    localStorage.removeItem("moon_admin_token");
    setToken("");
    setTurnos([]);
    setServicios([]);
    setProfesionales([]);
    setServicioProfesionales({});
    setDisponibilidad([]);
    setBloqueos([]);
    setMessage("");
    setError("");
  }, []);

  const handleAdminRequestError = useCallback(
    (requestError) => {
      if (requestError.status === 401 || requestError.status === 403) {
        resetAdminSession();
        return;
      }

      setError(requestError.message);
    },
    [resetAdminSession],
  );

  const sortedTurnos = useMemo(() => {
    const now = new Date();
    const professionalFilteredTurnos = turnosProfessionalFilter
      ? turnos.filter((turno) => String(turno.id_profesional) === turnosProfessionalFilter)
      : [];
    const filteredTurnos = professionalFilteredTurnos.filter((turno) => {
      const turnoDate = getTurnoDate(turno);

      if (turnosTimeFilter === "past") return turnoDate < now;
      if (turnosTimeFilter === "upcoming") return turnoDate >= now;
      return true;
    });

    return [...filteredTurnos].sort(compareTurnosForAgenda);
  }, [turnos, turnosProfessionalFilter, turnosTimeFilter]);

  const refreshAdminData = useCallback(async () => {
    try {
      setError("");
      const [nextTurnos, nextServicios, nextProfesionales] = await Promise.all([
        api.getTurnos(),
        api.getServicios(),
        api.getProfesionales(),
      ]);
      const nextServicioProfesionales = await buildServicioProfesionalesMap(nextProfesionales);
      setTurnos(nextTurnos);
      setServicios(nextServicios);
      setProfesionales(nextProfesionales);
      setServicioProfesionales(nextServicioProfesionales);
    } catch (requestError) {
      handleAdminRequestError(requestError);
    }
  }, [handleAdminRequestError]);

  useEffect(() => {
    if (!isLoggedIn) return;
    const timeoutId = window.setTimeout(refreshAdminData, 0);

    return () => window.clearTimeout(timeoutId);
  }, [isLoggedIn, refreshAdminData]);

  useEffect(() => {
    if (!isLoggedIn || !availabilityForm.idProfesional) return;

    api
      .getDisponibilidadProfesional(availabilityForm.idProfesional)
      .then(setDisponibilidad)
      .catch(handleAdminRequestError);
    api
      .getBloqueosProfesional(availabilityForm.idProfesional)
      .then(setBloqueos)
      .catch(handleAdminRequestError);
  }, [availabilityForm.idProfesional, handleAdminRequestError, isLoggedIn]);

  async function handleLogin(event) {
    event.preventDefault();

    try {
      setError("");
      const data = await api.login(loginForm);
      localStorage.setItem("moon_admin_token", data.token);
      setToken(data.token);
      setMessage("Sesion iniciada.");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  function handleLogout() {
    resetAdminSession();
  }

  async function handleEstadoChange(turnoId, estado) {
    try {
      setError("");
      const updatedTurno = await api.updateTurnoEstado(turnoId, estado);
      setTurnos((currentTurnos) =>
        currentTurnos.map((turno) => (turno.id === updatedTurno.id ? updatedTurno : turno)),
      );
      setMessage("Estado actualizado.");
    } catch (requestError) {
      handleAdminRequestError(requestError);
    }
  }

  async function handlePriceSubmit(event, service) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    try {
      setError("");
      const updatedService = await api.updateServicio(service.id, {
        nombre: service.nombre,
        seccion: formData.get("seccion"),
        ...buildServicePricePayload({
          precioTipo: formData.get("precioTipo"),
          precioMin: formData.get("precioMin"),
          precioMax: formData.get("precioMax"),
        }),
      });
      setServicios((currentServicios) =>
        currentServicios.map((item) => (item.id === updatedService.id ? updatedService : item)),
      );
      setMessage("Precio actualizado.");
    } catch (requestError) {
      handleAdminRequestError(requestError);
    }
  }

  async function handleDeleteService(service) {
    const confirmed = window.confirm(`Eliminar el servicio "${service.nombre}"?`);

    if (!confirmed) return;

    try {
      setError("");
      await api.deleteServicio(service.id);
      setServicios((currentServicios) =>
        currentServicios.filter((item) => item.id !== service.id),
      );
      setServicioProfesionales((currentMap) => {
        const nextMap = { ...currentMap };
        delete nextMap[service.id];
        return nextMap;
      });
      setTurnos((currentTurnos) =>
        currentTurnos.filter((turno) => turno.id_servicio !== service.id),
      );
      setMessage("Servicio eliminado.");
    } catch (requestError) {
      handleAdminRequestError(requestError);
    }
  }

  async function handleCreateService(event) {
    event.preventDefault();

    if (serviceForm.idProfesionales.length === 0) {
      setError("Selecciona al menos un profesional para vincular el servicio.");
      return;
    }

    try {
      setError("");
      const createdService = await api.createServicio({
        nombre: serviceForm.nombre,
        seccion: serviceForm.seccion,
        ...buildServicePricePayload(serviceForm),
      });
      await Promise.all(
        serviceForm.idProfesionales.map(async (idProfesional) => {
          const currentProfessionalServices = await api.getProfesionalServicios(idProfesional);
          const servicioIds = [
            ...new Set([
              ...currentProfessionalServices.map((service) => service.id),
              createdService.id,
            ]),
          ];
          await api.updateProfesionalServicios(idProfesional, servicioIds);
        }),
      );
      setServicios((currentServicios) => [...currentServicios, createdService]);
      setServicioProfesionales((currentMap) => ({
        ...currentMap,
        [createdService.id]: serviceForm.idProfesionales
          .map((idProfesional) =>
            profesionales.find((professional) => String(professional.id) === idProfesional),
          )
          .filter(Boolean)
          .map((professional) => professional.nombre),
      }));
      setServiceForm(emptyServiceForm);
      setMessage("Servicio agregado y vinculado a los profesionales seleccionados.");
    } catch (requestError) {
      handleAdminRequestError(requestError);
    }
  }

  async function handleCreateProfessional(event) {
    event.preventDefault();

    try {
      setError("");
      const createdProfessional = await api.createProfesional(professionalForm);
      setProfesionales((currentProfesionales) => [...currentProfesionales, createdProfessional]);
      setProfessionalForm(emptyProfessionalForm);
      setMessage("Profesional agregado.");
    } catch (requestError) {
      handleAdminRequestError(requestError);
    }
  }

  async function handleDeleteProfessional(professional) {
    const confirmed = window.confirm(`Eliminar el profesional "${professional.nombre}"?`);

    if (!confirmed) return;

    try {
      setError("");
      await api.deleteProfesional(professional.id);
      setProfesionales((currentProfesionales) =>
        currentProfesionales.filter((item) => item.id !== professional.id),
      );
      setDisponibilidad((currentDisponibilidad) =>
        currentDisponibilidad.filter((item) => item.id_profesional !== professional.id),
      );
      setBloqueos((currentBloqueos) =>
        currentBloqueos.filter((item) => item.id_profesional !== professional.id),
      );
      setTurnos((currentTurnos) =>
        currentTurnos.filter((turno) => turno.id_profesional !== professional.id),
      );
      setServicioProfesionales((currentMap) =>
        Object.fromEntries(
          Object.entries(currentMap).map(([serviceId, assignments]) => [
            serviceId,
            assignments.filter((name) => name !== professional.nombre),
          ]),
        ),
      );
      if (availabilityForm.idProfesional === String(professional.id)) {
        setAvailabilityForm((currentForm) => ({
          ...currentForm,
          idProfesional: "",
        }));
      }
      if (turnosProfessionalFilter === String(professional.id)) {
        const nextProfessional = profesionales.find((item) => item.id !== professional.id);
        setTurnosProfessionalFilter(nextProfessional ? String(nextProfessional.id) : "");
      }
      setMessage("Profesional eliminado.");
    } catch (requestError) {
      handleAdminRequestError(requestError);
    }
  }

  async function handleClearProfessionalTurns(professional) {
    const confirmed = window.confirm(
      `Eliminar todos los turnos de "${professional.nombre}"? Esta accion no se puede deshacer.`,
    );

    if (!confirmed) return;

    try {
      setError("");
      const result = await api.deleteTurnosByProfesional(professional.id);
      setTurnos((currentTurnos) =>
        currentTurnos.filter((turno) => turno.id_profesional !== professional.id),
      );
      setMessage(`Turnos eliminados: ${result.deletedCount}.`);
    } catch (requestError) {
      handleAdminRequestError(requestError);
    }
  }

  async function handleAvailabilitySubmit(event) {
    event.preventDefault();

    try {
      setError("");
      const nextDisponibilidad = await api.updateDisponibilidadProfesional(
        availabilityForm.idProfesional,
        {
          diaSemana: Number(availabilityForm.diaSemana),
          horaInicio: availabilityForm.horaInicio,
          horaFin: availabilityForm.horaFin,
          intervaloMinutos: Number(availabilityForm.intervaloMinutos),
        },
      );

      setDisponibilidad((currentDisponibilidad) => {
        const withoutSameDay = currentDisponibilidad.filter(
          (item) => item.dia_semana !== nextDisponibilidad.dia_semana,
        );
        return [...withoutSameDay, nextDisponibilidad].sort(
          (a, b) => a.dia_semana - b.dia_semana,
        );
      });
      setMessage("Disponibilidad guardada.");
    } catch (requestError) {
      handleAdminRequestError(requestError);
    }
  }

  async function handleDeleteAvailability(day) {
    try {
      setError("");
      await api.deleteDisponibilidadProfesional(availabilityForm.idProfesional, day);
      setDisponibilidad((currentDisponibilidad) =>
        currentDisponibilidad.filter((item) => item.dia_semana !== day),
      );
      setMessage("Disponibilidad eliminada.");
    } catch (requestError) {
      handleAdminRequestError(requestError);
    }
  }

  async function handleCreateBlock(event) {
    event.preventDefault();

    try {
      setError("");
      const bloqueo = await api.createBloqueoProfesional(availabilityForm.idProfesional, {
        fecha: blockForm.fecha,
        horaInicio: blockForm.horaInicio,
        horaFin: blockForm.horaFin,
        motivo: blockForm.motivo || null,
      });
      setBloqueos((currentBloqueos) => [bloqueo, ...currentBloqueos]);
      setBlockForm(emptyBlockForm);
      setMessage("Bloqueo guardado.");
    } catch (requestError) {
      handleAdminRequestError(requestError);
    }
  }

  async function handleDeleteBlock(blockId) {
    try {
      setError("");
      await api.deleteBloqueo(blockId);
      setBloqueos((currentBloqueos) => currentBloqueos.filter((item) => item.id !== blockId));
      setMessage("Bloqueo eliminado.");
    } catch (requestError) {
      handleAdminRequestError(requestError);
    }
  }

  if (!isLoggedIn) {
    return (
      <main className="admin-page min-h-screen px-5 py-10">
        <section className="admin-login mx-auto w-full max-w-md rounded-lg border border-outline-variant/40 bg-surface-container-low p-6 shadow-halo">
          <a className="font-display text-3xl text-primary" href="/">
            MOON STUDIO
          </a>
          <h1 className="mt-8 font-display text-5xl leading-none text-primary">Admin</h1>
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <label className="block">
              <span className="form-label">Usuario</span>
              <input
                className="form-input form-input-boxed"
                onChange={(event) => setLoginForm({ ...loginForm, nombre: event.target.value })}
                required
                type="text"
                value={loginForm.nombre}
              />
            </label>
            <label className="block">
              <span className="form-label">Password</span>
              <input
                className="form-input form-input-boxed"
                onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })}
                required
                type="password"
                value={loginForm.password}
              />
            </label>
            {error ? <p className="admin-error">{error}</p> : null}
            <button className="button-primary w-full" type="submit">
              Ingresar
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-page min-h-screen px-5 py-8 md:px-10">
      <div className="mx-auto max-w-container">
        <header className="flex flex-col gap-5 border-b border-outline-variant/50 pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <a className="font-display text-3xl text-primary" href="/">
              MOON STUDIO
            </a>
            <h1 className="mt-4 font-display text-5xl leading-none text-primary">Panel admin</h1>
          </div>
          <button className="button-secondary w-full md:w-fit" onClick={handleLogout} type="button">
            Salir
          </button>
        </header>

        <label className="admin-tabs-select mt-6">
          <span className="form-label">Seccion</span>
          <select
            className="form-input form-input-boxed"
            onChange={(event) => {
              if (event.target.value === "actualizar") {
                refreshAdminData();
                return;
              }
              setActiveTab(event.target.value);
            }}
            value={activeTab}
          >
            <option value="turnos">Turnos</option>
            <option value="servicios">Servicios y precios</option>
            <option value="disponibilidad">Disponibilidad</option>
            <option value="actualizar">Actualizar datos</option>
          </select>
        </label>

        <div className="admin-tabs mt-6">
          <button
            className={`admin-tab ${activeTab === "turnos" ? "admin-tab-active" : ""}`}
            onClick={() => setActiveTab("turnos")}
            type="button"
          >
            Turnos
          </button>
          <button
            className={`admin-tab ${activeTab === "servicios" ? "admin-tab-active" : ""}`}
            onClick={() => setActiveTab("servicios")}
            type="button"
          >
            Servicios y precios
          </button>
          <button
            className={`admin-tab ${activeTab === "disponibilidad" ? "admin-tab-active" : ""}`}
            onClick={() => setActiveTab("disponibilidad")}
            type="button"
          >
            Disponibilidad
          </button>
          <button className="admin-tab" onClick={refreshAdminData} type="button">
            Actualizar
          </button>
        </div>

        {message ? <p className="admin-message">{message}</p> : null}
        {error ? <p className="admin-error">{error}</p> : null}

        {activeTab === "turnos" ? (
          <section className="admin-panel mt-8">
            <div className="admin-panel-header">
              <div>
                <h2 className="admin-panel-title">Turnos del estudio</h2>
                <p className="mt-2 text-on-surface-variant">
                  Visualiza la agenda de cada profesional.
                </p>
              </div>
              <div className="admin-turnos-filters">
                <label className="block">
                  <span className="form-label">Vista</span>
                  <select
                    className="form-input form-input-boxed"
                    onChange={(event) => setTurnosTimeFilter(event.target.value)}
                    value={turnosTimeFilter}
                  >
                    <option value="upcoming">Proximos</option>
                    <option value="past">Pasados</option>
                    <option value="all">Todos</option>
                  </select>
                </label>
                <label className="block">
                  <span className="form-label">Profesional</span>
                  <select
                    className="form-input form-input-boxed"
                    onChange={(event) => setTurnosProfessionalFilter(event.target.value)}
                    value={turnosProfessionalFilter}
                  >
                    <option value="">Agenda de ...</option>
                    {profesionales.map((professional) => (
                      <option key={professional.id} value={professional.id}>
                        {professional.nombre}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
            <div className="admin-turnos-list mt-5">
              {!turnosProfessionalFilter ? (
                <div className="admin-empty-state">
                  <p className="text-label uppercase text-tertiary">Agenda</p>
                  <h3>Selecciona una profesional</h3>
                  <p>Los turnos se cargan aca cuando elegis una agenda puntual.</p>
                </div>
              ) : sortedTurnos.length > 0 ? (
                sortedTurnos.map((turno) => (
                  <article className="admin-turno" key={turno.id}>
                    <div>
                      <p className="text-label uppercase text-tertiary">{turno.estado}</p>
                      <div className="admin-turno-date">
                        <span>{formatWeekday(turno.fecha)}</span>
                        <strong>{formatDate(turno.fecha)}</strong>
                      </div>
                      <p className="admin-turno-hour">{String(turno.hora).slice(0, 5)} hs</p>
                      <p className="mt-2 text-base font-medium text-primary">
                        {turno.nombre_cliente}
                      </p>
                    </div>
                    <div className="admin-turno-details">
                      <span>{turno.servicio_nombre}</span>
                      <span>{turno.profesional_nombre}</span>
                      <span>{turno.telefono_cliente}</span>
                      <span>{turno.email_cliente}</span>
                    </div>
                    <label className="block">
                      <span className="form-label">Estado</span>
                      <select
                        className="form-input form-input-boxed"
                        onChange={(event) => handleEstadoChange(turno.id, event.target.value)}
                        value={turno.estado}
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="confirmado">Confirmado</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                    </label>
                  </article>
                ))
              ) : (
                <p className="text-on-surface-variant">Todavia no hay turnos cargados.</p>
              )}
            </div>
          </section>
        ) : activeTab === "servicios" ? (
          <section className="admin-grid mt-8">
            <div className="admin-panel">
              <h2 className="admin-panel-title">Servicios</h2>
              <form className="mt-5 grid gap-4" onSubmit={handleCreateService}>
                <input
                  className="form-input form-input-boxed"
                  onChange={(event) => setServiceForm({ ...serviceForm, nombre: event.target.value })}
                  placeholder="Nuevo servicio"
                  required
                  value={serviceForm.nombre}
                />
                <select
                  className="form-input form-input-boxed"
                  onChange={(event) =>
                    setServiceForm({ ...serviceForm, seccion: event.target.value })
                  }
                  required
                  value={serviceForm.seccion}
                >
                  {serviceSections.map((section) => (
                    <option key={section.value} value={section.value}>
                      {section.label}
                    </option>
                  ))}
                </select>
                <select
                  className="form-input form-input-boxed"
                  onChange={(event) =>
                    setServiceForm({
                      ...serviceForm,
                      precioTipo: event.target.value,
                      precioMin: event.target.value === "consultar" ? "" : serviceForm.precioMin,
                      precioMax: event.target.value === "rango" ? serviceForm.precioMax : "",
                    })
                  }
                  value={serviceForm.precioTipo}
                >
                  <option value="consultar">Precio a consultar</option>
                  <option value="fijo">Precio fijo</option>
                  <option value="desde">Desde</option>
                  <option value="rango">Rango</option>
                </select>
                {serviceForm.precioTipo !== "consultar" ? (
                  <input
                    className="form-input form-input-boxed"
                    min="0"
                    onChange={(event) =>
                      setServiceForm({ ...serviceForm, precioMin: event.target.value })
                    }
                    placeholder={serviceForm.precioTipo === "rango" ? "Precio minimo" : "Precio"}
                    required
                    step="0.01"
                    type="number"
                    value={serviceForm.precioMin}
                  />
                ) : null}
                {serviceForm.precioTipo === "rango" ? (
                  <input
                    className="form-input form-input-boxed"
                    min="0"
                    onChange={(event) =>
                      setServiceForm({ ...serviceForm, precioMax: event.target.value })
                    }
                    placeholder="Precio maximo"
                    required
                    step="0.01"
                    type="number"
                    value={serviceForm.precioMax}
                  />
                ) : null}
                <div className="admin-checkbox-group">
                  <span className="form-label">Profesionales</span>
                  {profesionales.map((professional) => (
                    <label className="admin-checkbox-option" key={professional.id}>
                      <input
                        checked={serviceForm.idProfesionales.includes(String(professional.id))}
                        onChange={(event) =>
                          setServiceForm({
                            ...serviceForm,
                            idProfesionales: toggleSelectedValue(
                              serviceForm.idProfesionales,
                              String(professional.id),
                              event.target.checked,
                            ),
                          })
                        }
                        type="checkbox"
                      />
                      <span>{professional.nombre}</span>
                    </label>
                  ))}
                </div>
                <button className="button-primary" type="submit">
                  Agregar servicio
                </button>
              </form>

              <details className="admin-disclosure mt-7">
                <summary>
                  <span>
                    <strong>Servicios cargados</strong>
                    <small>{servicios.length} servicios</small>
                  </span>
                </summary>
                <div className="admin-disclosure-body">
                  <div className="admin-scroll-list">
                    {servicios.map((service) => (
                      <form
                        className="admin-price-row"
                        key={service.id}
                        onSubmit={(event) => handlePriceSubmit(event, service)}
                      >
                        <span>
                          {service.nombre}
                          <small>{getServiceSectionLabel(service.seccion)}</small>
                          <small>{formatServicePrice(service)}</small>
                          <small className="admin-assignment-list">
                            {formatServiceAssignments(servicioProfesionales[service.id])}
                          </small>
                        </span>
                        <select
                          className="form-input form-input-boxed"
                          defaultValue={service.seccion ?? "peluqueria"}
                          name="seccion"
                        >
                          {serviceSections.map((section) => (
                            <option key={section.value} value={section.value}>
                              {section.label}
                            </option>
                          ))}
                        </select>
                        <select
                          className="form-input form-input-boxed"
                          defaultValue={service.precio_tipo ?? "consultar"}
                          name="precioTipo"
                        >
                          <option value="consultar">Consultar</option>
                          <option value="fijo">Fijo</option>
                          <option value="desde">Desde</option>
                          <option value="rango">Rango</option>
                        </select>
                        <input
                          className="form-input form-input-boxed"
                          defaultValue={service.precio_min ?? ""}
                          min="0"
                          name="precioMin"
                          placeholder="Minimo"
                          step="0.01"
                          type="number"
                        />
                        <input
                          className="form-input form-input-boxed"
                          defaultValue={service.precio_max ?? ""}
                          min="0"
                          name="precioMax"
                          placeholder="Maximo"
                          step="0.01"
                          type="number"
                        />
                        <button className="button-secondary" type="submit">
                          Guardar
                        </button>
                        <button
                          className="admin-danger-button"
                          onClick={() => handleDeleteService(service)}
                          type="button"
                        >
                          Eliminar
                        </button>
                      </form>
                    ))}
                  </div>
                </div>
              </details>
            </div>

            <div className="admin-panel">
              <h2 className="admin-panel-title">Profesionales</h2>
              <form className="mt-5 grid gap-4" onSubmit={handleCreateProfessional}>
                <input
                  className="form-input form-input-boxed"
                  onChange={(event) =>
                    setProfessionalForm({ ...professionalForm, nombre: event.target.value })
                  }
                  placeholder="Nuevo profesional"
                  required
                  value={professionalForm.nombre}
                />
                <button className="button-primary" type="submit">
                  Agregar profesional
                </button>
              </form>

              <div className="admin-scroll-list admin-scroll-list-small mt-7">
                {profesionales.map((professional) => (
                  <div className="admin-professional-row" key={professional.id}>
                    <span>{professional.nombre}</span>
                    <div className="admin-row-actions">
                      <button
                        className="admin-compact-button"
                        onClick={() => handleClearProfessionalTurns(professional)}
                        type="button"
                      >
                        Vaciar turnos
                      </button>
                      <button
                        className="admin-compact-button admin-compact-danger"
                        onClick={() => handleDeleteProfessional(professional)}
                        type="button"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : (
          <section className="admin-panel mt-8">
            <h2 className="admin-panel-title">Disponibilidad</h2>
            <form className="mt-5 grid gap-4 md:grid-cols-5" onSubmit={handleAvailabilitySubmit}>
              <label className="block md:col-span-2">
                <span className="form-label">Profesional</span>
                <select
                  className="form-input form-input-boxed"
                  onChange={(event) =>
                    setAvailabilityForm({
                      ...availabilityForm,
                      idProfesional: event.target.value,
                    })
                  }
                  required
                  value={availabilityForm.idProfesional}
                >
                  <option value="">Disponibilidad de ...</option>
                  {profesionales.map((professional) => (
                    <option key={professional.id} value={professional.id}>
                      {professional.nombre}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="form-label">Dia</span>
                <select
                  className="form-input form-input-boxed"
                  onChange={(event) =>
                    setAvailabilityForm({ ...availabilityForm, diaSemana: event.target.value })
                  }
                  value={availabilityForm.diaSemana}
                >
                  {diasSemana.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="form-label">Desde</span>
                <input
                  className="form-input form-input-boxed"
                  onChange={(event) =>
                    setAvailabilityForm({ ...availabilityForm, horaInicio: event.target.value })
                  }
                  required
                  type="time"
                  value={availabilityForm.horaInicio}
                />
              </label>
              <label className="block">
                <span className="form-label">Hasta</span>
                <input
                  className="form-input form-input-boxed"
                  onChange={(event) =>
                    setAvailabilityForm({ ...availabilityForm, horaFin: event.target.value })
                  }
                  required
                  type="time"
                  value={availabilityForm.horaFin}
                />
              </label>
              <label className="block">
                <span className="form-label">Intervalo</span>
                <select
                  className="form-input form-input-boxed"
                  onChange={(event) =>
                    setAvailabilityForm({
                      ...availabilityForm,
                      intervaloMinutos: event.target.value,
                    })
                  }
                  value={availabilityForm.intervaloMinutos}
                >
                  {intervalos.map((intervalo) => (
                    <option key={intervalo.value} value={intervalo.value}>
                      {intervalo.label}
                    </option>
                  ))}
                </select>
              </label>
              <button className="button-primary md:col-span-5" type="submit">
                Guardar disponibilidad
              </button>
            </form>

            {!availabilityForm.idProfesional ? (
              <div className="admin-empty-state mt-7">
                <p className="text-label uppercase text-tertiary">Disponibilidad</p>
                <h3>Selecciona una profesional</h3>
                <p>La disponibilidad semanal y los bloqueos se cargan al elegir una agenda.</p>
              </div>
            ) : (
              <div className="admin-scroll-list admin-scroll-list-small mt-7">
                {disponibilidad.length > 0 ? (
                  disponibilidad.map((item) => (
                    <div className="admin-list-row" key={item.id}>
                      <span>
                        {getDayLabel(item.dia_semana)} · {String(item.hora_inicio).slice(0, 5)} a{" "}
                        {String(item.hora_fin).slice(0, 5)} · cada {item.intervalo_minutos} min
                      </span>
                      <button
                        className="admin-danger-button"
                        onClick={() => handleDeleteAvailability(item.dia_semana)}
                        type="button"
                      >
                        Eliminar
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-on-surface-variant">
                    Todavia no hay disponibilidad cargada para este profesional.
                  </p>
                )}
              </div>
            )}

            {availabilityForm.idProfesional ? (
            <details className="admin-subsection admin-disclosure">
              <summary>
                <span>
                  <strong>Bloqueos puntuales</strong>
                  <small>{bloqueos.length} cargados</small>
                </span>
              </summary>
              <div className="admin-disclosure-body">
                <form className="grid gap-4 md:grid-cols-5" onSubmit={handleCreateBlock}>
                  <label className="block">
                    <span className="form-label">Fecha</span>
                    <input
                      className="form-input form-input-boxed"
                      onChange={(event) =>
                        setBlockForm({ ...blockForm, fecha: event.target.value })
                      }
                      required
                      type="date"
                      value={blockForm.fecha}
                    />
                  </label>
                  <label className="block">
                    <span className="form-label">Desde</span>
                    <input
                      className="form-input form-input-boxed"
                      onChange={(event) =>
                        setBlockForm({ ...blockForm, horaInicio: event.target.value })
                      }
                      required
                      type="time"
                      value={blockForm.horaInicio}
                    />
                  </label>
                  <label className="block">
                    <span className="form-label">Hasta</span>
                    <input
                      className="form-input form-input-boxed"
                      onChange={(event) =>
                        setBlockForm({ ...blockForm, horaFin: event.target.value })
                      }
                      required
                      type="time"
                      value={blockForm.horaFin}
                    />
                  </label>
                  <label className="block md:col-span-2">
                    <span className="form-label">Motivo</span>
                    <input
                      className="form-input form-input-boxed"
                      onChange={(event) =>
                        setBlockForm({ ...blockForm, motivo: event.target.value })
                      }
                      placeholder="Ej. turno por fuera de la web"
                      value={blockForm.motivo}
                    />
                  </label>
                  <button className="button-primary md:col-span-5" type="submit">
                    Bloquear horario
                  </button>
                </form>

                <div className="admin-scroll-list admin-scroll-list-small mt-7">
                  {bloqueos.length > 0 ? (
                    bloqueos.map((block) => (
                      <div className="admin-list-row" key={block.id}>
                        <span>
                          {formatDate(block.fecha)} · {String(block.hora_inicio).slice(0, 5)} a{" "}
                          {String(block.hora_fin).slice(0, 5)}
                          {block.motivo ? ` · ${block.motivo}` : ""}
                        </span>
                        <button
                          className="admin-danger-button"
                          onClick={() => handleDeleteBlock(block.id)}
                          type="button"
                        >
                          Eliminar
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-on-surface-variant">
                      No hay bloqueos puntuales para este profesional.
                    </p>
                  )}
                </div>
              </div>
            </details>
            ) : null}
          </section>
        )}
      </div>
    </main>
  );
}

function getDayLabel(day) {
  return diasSemana.find((item) => item.value === day)?.label || "";
}

async function buildServicioProfesionalesMap(profesionales) {
  const entries = await Promise.all(
    profesionales.map(async (professional) => {
      try {
        const professionalServices = await api.getProfesionalServicios(professional.id);
        return professionalServices.map((service) => [service.id, professional.nombre]);
      } catch {
        return [];
      }
    }),
  );

  return entries.flat().reduce((map, [serviceId, professionalName]) => {
    return {
      ...map,
      [serviceId]: [...(map[serviceId] || []), professionalName],
    };
  }, {});
}

function buildServicePricePayload(values) {
  const precioTipo = values.precioTipo || "consultar";
  const precioMin = values.precioMin === "" || values.precioMin === null ? null : Number(values.precioMin);
  const precioMax = values.precioMax === "" || values.precioMax === null ? null : Number(values.precioMax);

  return {
    precio_tipo: precioTipo,
    precio_min: precioTipo === "consultar" ? null : precioMin,
    precio_max: precioTipo === "rango" ? precioMax : null,
  };
}

function getServiceSectionLabel(value) {
  return serviceSections.find((section) => section.value === value)?.label || "Peluquería";
}

function toggleSelectedValue(values, value, isSelected) {
  if (isSelected) return [...new Set([...values, value])];
  return values.filter((item) => item !== value);
}

function formatServiceAssignments(assignments = []) {
  if (assignments.length === 0) return "Sin profesionales asignados";
  return `Asignado a: ${assignments.join(", ")}`;
}

function formatServicePrice(service) {
  const priceType = service.precio_tipo || "consultar";
  const min = formatCurrency(service.precio_min ?? service.precio);
  const max = formatCurrency(service.precio_max);

  if (priceType === "fijo" && min) return min;
  if (priceType === "desde" && min) return `Desde ${min}`;
  if (priceType === "rango" && min && max) return `${min} a ${max}`;
  return "Precio a consultar";
}

function formatCurrency(value) {
  if (value === null || value === undefined || value === "") return "";
  return `$${Number(value).toLocaleString("es-AR")}`;
}

function formatDate(value) {
  if (!value) return "";
  const dateOnly = String(value).split("T")[0];
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${dateOnly}T12:00:00`));
}

function formatWeekday(value) {
  if (!value) return "";
  const dateOnly = String(value).split("T")[0];
  return new Intl.DateTimeFormat("es-AR", { weekday: "long" }).format(
    new Date(`${dateOnly}T12:00:00`),
  );
}

function compareTurnosForAgenda(a, b) {
  const now = new Date();
  const dateA = getTurnoDate(a);
  const dateB = getTurnoDate(b);
  const rankA = getTurnoAgendaRank(a, dateA, now);
  const rankB = getTurnoAgendaRank(b, dateB, now);

  if (rankA !== rankB) return rankA - rankB;
  return dateA - dateB;
}

function getTurnoAgendaRank(turno, date, now) {
  if (date < now) return 3;
  if (turno.estado === "cancelado") return 2;
  return 1;
}

function getTurnoDate(turno) {
  const dateOnly = String(turno.fecha).split("T")[0];
  const timeOnly = String(turno.hora || "00:00").slice(0, 5);
  return new Date(`${dateOnly}T${timeOnly}:00`);
}
