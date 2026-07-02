import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api.js";

const initialFormValues = {
  name: "",
  email: "",
  phone: "",
  time: "",
};

const NAME_REGEX = /^[A-Za-zÀ-ÿÑñ\s]{2,80}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_REGEX = /^\d{7,12}$/;
const ALLOWED_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "yahoo.com",
  "icloud.com",
]);
const serviceSections = [
  { value: "peluqueria", label: "Peluquería" },
  { value: "cejas_pestanas", label: "Cejas y pestañas" },
  { value: "manos_unas", label: "Manos y uñas" },
  { value: "podoestetica", label: "Podoestética" },
];

export default function Booking() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formValues, setFormValues] = useState(initialFormValues);
  const [formErrors, setFormErrors] = useState({});
  const [servicios, setServicios] = useState([]);
  const [profesionales, setProfesionales] = useState([]);
  const [serviciosPorProfesional, setServiciosPorProfesional] = useState({});
  const [selectedServiceSection, setSelectedServiceSection] = useState("");
  const [selectedServicio, setSelectedServicio] = useState("");
  const [selectedProfesional, setSelectedProfesional] = useState("");
  const [acceptsProfessionalContact, setAcceptsProfessionalContact] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  const [isLoadingHorarios, setIsLoadingHorarios] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingConfirmation, setBookingConfirmation] = useState(null);
  const dateOptions = useMemo(() => buildDateOptions(30), []);
  const selectedServiceData = useMemo(
    () => servicios.find((service) => String(service.id) === selectedServicio) || null,
    [selectedServicio, servicios],
  );
  const filteredServicios = useMemo(() => {
    if (!selectedServiceSection) return [];
    return servicios.filter(
      (service) => (service.seccion || "peluqueria") === selectedServiceSection,
    );
  }, [selectedServiceSection, servicios]);
  const profesionalesPorServicio = useMemo(() => {
    const serviceMap = {};

    profesionales.forEach((professional) => {
      const professionalServices = serviciosPorProfesional[professional.id] || [];
      professionalServices.forEach((serviceId) => {
        if (!serviceMap[serviceId]) serviceMap[serviceId] = [];
        serviceMap[serviceId].push(professional.nombre);
      });
    });

    return serviceMap;
  }, [profesionales, serviciosPorProfesional]);
  const selectedServiceProfessionals = selectedServiceData
    ? profesionalesPorServicio[String(selectedServiceData.id)] || []
    : [];

  useEffect(() => {
    let isMounted = true;

    async function loadBookingData() {
      try {
        const [nextServicios, nextProfesionales] = await Promise.all([
          api.getServicios(),
          api.getProfesionales(),
        ]);
        const serviceEntries = await Promise.all(
          nextProfesionales.map(async (professional) => {
            try {
              const professionalServices = await api.getProfesionalServicios(professional.id);
              return [professional.id, professionalServices.map((service) => String(service.id))];
            } catch {
              return [professional.id, []];
            }
          }),
        );

        if (!isMounted) return;

        setServicios(nextServicios);
        setProfesionales(nextProfesionales);
        setServiciosPorProfesional(Object.fromEntries(serviceEntries));
      } catch {
        if (!isMounted) return;
        setStatus({
          type: "error",
          message: "No pudimos cargar los turnos disponibles. Proba nuevamente mas tarde.",
        });
      }
    }

    loadBookingData();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!bookingConfirmation) return undefined;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setBookingConfirmation(null);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [bookingConfirmation]);

  const profesionalesDisponibles = useMemo(() => {
    if (!selectedServicio) return profesionales;

    const withServiceData = profesionales.filter(
      (professional) => serviciosPorProfesional[professional.id]?.length > 0,
    );

    if (withServiceData.length === 0) return profesionales;

    return profesionales.filter((professional) =>
      serviciosPorProfesional[professional.id]?.includes(selectedServicio),
    );
  }, [profesionales, selectedServicio, serviciosPorProfesional]);

  useEffect(() => {
    let isMounted = true;

    if (!selectedProfesional || !selectedDate) {
      return undefined;
    }

    async function loadHorarios() {
      try {
        setIsLoadingHorarios(true);
        const horarios = await api.getHorariosDisponibles(selectedProfesional, selectedDate);

        if (isMounted) {
          setHorariosDisponibles(horarios);
        }
      } catch {
        if (isMounted) {
          setHorariosDisponibles([]);
        }
      } finally {
        if (isMounted) {
          setIsLoadingHorarios(false);
        }
      }
    }

    loadHorarios();

    return () => {
      isMounted = false;
    };
  }, [selectedDate, selectedProfesional]);

  const visibleHorarios = selectedProfesional && selectedDate ? horariosDisponibles : [];

  function updateField(name, value) {
    const nextValue = sanitizeFieldValue(name, value);

    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: nextValue,
    }));

    setFormErrors((currentErrors) => ({
      ...currentErrors,
      [name]: "",
    }));
  }

  function canGoToStepTwo() {
    return Object.keys(validateClientData(formValues)).length === 0;
  }

  function canGoToStepThree() {
    return selectedServicio && selectedProfesional && acceptsProfessionalContact;
  }

  function canSubmit() {
    return canGoToStepTwo() && canGoToStepThree() && selectedDate && formValues.time;
  }

  function goNext() {
    setStatus({ type: "", message: "" });

    if (currentStep === 1) {
      const nextErrors = validateClientData(formValues);
      if (Object.keys(nextErrors).length > 0) {
        setFormErrors(nextErrors);
        setStatus({ type: "error", message: "Revisa tus datos para continuar." });
        return;
      }
    }

    if (currentStep === 1 && !canGoToStepTwo()) {
      return;
    }

    if (currentStep === 2 && !canGoToStepThree()) {
      setStatus({
        type: "error",
        message: "Selecciona servicio, profesional y acepta el contacto para continuar.",
      });
      return;
    }

    setCurrentStep((step) => Math.min(step + 1, 3));
  }

  function goBack() {
    setStatus({ type: "", message: "" });
    setCurrentStep((step) => Math.max(step - 1, 1));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = validateClientData(formValues);
    if (Object.keys(nextErrors).length > 0) {
      setFormErrors(nextErrors);
      setCurrentStep(1);
      setStatus({ type: "error", message: "Revisa tus datos para continuar." });
      return;
    }

    if (!canSubmit()) {
      setStatus({ type: "error", message: "Completa todos los datos del turno." });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: "", message: "" });

    try {
      const createdTurno = await api.createTurno({
        nombreCliente: normalizeName(formValues.name),
        emailCliente: normalizeEmail(formValues.email),
        telefonoCliente: normalizePhone(formValues.phone),
        idProfesional: Number(selectedProfesional),
        idServicio: Number(selectedServicio),
        fecha: selectedDate,
        hora: formValues.time,
      });

      setBookingConfirmation({
        fecha: selectedDate,
        hora: String(createdTurno.hora || formValues.time).slice(0, 5),
        profesional: createdTurno.profesional_nombre,
        servicio: createdTurno.servicio_nombre,
      });
      setFormValues(initialFormValues);
      setFormErrors({});
      setSelectedServiceSection("");
      setSelectedServicio("");
      setSelectedProfesional("");
      setAcceptsProfessionalContact(false);
      setSelectedDate("");
      setHorariosDisponibles([]);
      setCurrentStep(1);
      setStatus({ type: "", message: "" });
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="section-shell" id="reservar">
      <div className="section-heading" data-reveal>
        <p className="text-label uppercase text-tertiary">Reservar turno</p>
        <h2>Agenda tu cita</h2>
        <p>Reserva tu turno en 3 simples pasos.</p>
      </div>

      <div className="booking-form-wrap" data-reveal data-reveal-delay="1">
        <form
          className="booking-form-card rounded-lg border border-outline-variant/30 bg-surface-bright/70 p-6 shadow-halo backdrop-blur-sm md:p-10"
          onSubmit={handleSubmit}
        >
          <div className="booking-steps" aria-label="Pasos de reserva">
            <StepIndicator currentStep={currentStep} number={1} title="Datos" />
            <StepIndicator currentStep={currentStep} number={2} title="Servicio" />
            <StepIndicator currentStep={currentStep} number={3} title="Turno" />
          </div>

          {currentStep === 1 ? (
            <FormGroup title="Tus datos">
              <Field
                autoComplete="name"
                error={formErrors.name}
                id="name"
                label="Nombre completo"
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="Ej. Sofia Rossi"
                required
                value={formValues.name}
              />
              <div className="grid gap-6 md:grid-cols-2">
                <Field
                  autoComplete="email"
                  error={formErrors.email}
                  id="email"
                  inputMode="email"
                  label="Correo electronico"
                  onChange={(event) => updateField("email", event.target.value)}
                  placeholder="correo@gmail.com"
                  required
                  type="email"
                  value={formValues.email}
                />
                <Field
                  autoComplete="tel"
                  error={formErrors.phone}
                  id="phone"
                  inputMode="numeric"
                  label="Telefono"
                  maxLength={12}
                  onChange={(event) => updateField("phone", event.target.value)}
                  placeholder="2494412345"
                  required
                  type="tel"
                  value={formValues.phone}
                />
              </div>
            </FormGroup>
          ) : null}

          {currentStep === 2 ? (
            <>
              <FormGroup title="Servicio">
                <label className="booking-select-shell">
                  <span className="form-label">Sector</span>
                  <select
                    className="form-input form-input-boxed booking-service-select"
                    name="service-section-select"
                    onChange={(event) => {
                      setSelectedServiceSection(event.target.value);
                      setSelectedServicio("");
                      setSelectedProfesional("");
                      setSelectedDate("");
                      updateField("time", "");
                    }}
                    required
                    value={selectedServiceSection}
                  >
                    <option value="">Selecciona un sector</option>
                    {serviceSections.map((section) => (
                      <option key={section.value} value={section.value}>
                        {section.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="booking-select-shell">
                  <span className="form-label">Servicio</span>
                  <select
                    className="form-input form-input-boxed booking-service-select"
                    disabled={!selectedServiceSection}
                    name="service-select"
                    onChange={(event) => {
                      setSelectedServicio(event.target.value);
                      setSelectedProfesional("");
                      setSelectedDate("");
                      updateField("time", "");
                    }}
                    required
                    value={selectedServicio}
                  >
                    <option value="">
                      {selectedServiceSection
                        ? "Selecciona un servicio"
                        : "Selecciona un sector primero"}
                    </option>
                    {filteredServicios.map((service) => (
                      <option key={service.id} value={service.id}>
                        {formatServiceOption(service, profesionalesPorServicio[String(service.id)])}
                      </option>
                    ))}
                  </select>
                </label>
                {selectedServiceData ? (
                  <div className="booking-service-summary">
                    <div>
                      <span>{selectedServiceData.nombre}</span>
                      {selectedServiceProfessionals.length > 0 ? (
                        <small>
                          Asignado a {formatProfessionalList(selectedServiceProfessionals)}
                        </small>
                      ) : null}
                    </div>
                    <strong>{formatServicePrice(selectedServiceData)}</strong>
                  </div>
                ) : (
                  <p className="booking-select-help">
                    Elegi primero el sector y el servicio para ver las profesionales disponibles.
                  </p>
                )}
                <div className="hidden">
                  {filteredServicios.map((service) => (
                    <label className="cursor-pointer" key={service.id}>
                      <input
                        checked={selectedServicio === String(service.id)}
                        className="peer sr-only"
                        name="service"
                        onChange={(event) => {
                          setSelectedServicio(event.target.value);
                          setSelectedProfesional("");
                          setSelectedDate("");
                          updateField("time", "");
                        }}
                        required
                        type="radio"
                        value={service.id}
                      />
                      <span className="inline-flex rounded-full border border-outline-variant px-4 py-3 text-sm text-on-surface-variant transition peer-checked:border-secondary peer-checked:bg-secondary/10 peer-checked:text-secondary">
                        {service.nombre}
                        {formatServicePrice(service) !== "Precio a consultar"
                          ? ` · ${formatServicePrice(service)}`
                          : ""}
                      </span>
                    </label>
                  ))}
                </div>
              </FormGroup>

              <FormGroup title="Profesional">
                <label className="block">
                  <span className="form-label">Profesional</span>
                  <select
                    className="form-input form-input-boxed"
                    disabled={!selectedServicio}
                    name="professional"
                    onChange={(event) => {
                      setSelectedProfesional(event.target.value);
                      setSelectedDate("");
                      updateField("time", "");
                    }}
                    required
                    value={selectedProfesional}
                  >
                    <option value="">Selecciona una profesional</option>
                    {profesionalesDisponibles.map((professional) => (
                      <option key={professional.id} value={professional.id}>
                        {professional.nombre}
                      </option>
                    ))}
                  </select>
                </label>
              </FormGroup>

              <label className="booking-contact-consent">
                <input
                  checked={acceptsProfessionalContact}
                  onChange={(event) => {
                    setAcceptsProfessionalContact(event.target.checked);
                    setStatus({ type: "", message: "" });
                  }}
                  required
                  type="checkbox"
                />
                <span>
                  Acepto que, si fuera necesario, la profesional se comunique conmigo para
                  personalizar mi experiencia.
                </span>
              </label>
            </>
          ) : null}

          {currentStep === 3 ? (
            <FormGroup title="Fecha y hora">
              <div className="grid gap-6 md:grid-cols-2">
                <label className="block">
                  <span className="form-label">Dia</span>
                  <select
                    className="form-input form-input-boxed"
                    name="date"
                    onChange={(event) => {
                      setSelectedDate(event.target.value);
                      updateField("time", "");
                    }}
                    required
                    value={selectedDate}
                  >
                    <option value="">Selecciona un dia</option>
                    {dateOptions.map((day) => (
                      <option key={day.value} value={day.value}>
                        {day.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="form-label">Horario preferido</span>
                  <select
                    className="form-input form-input-boxed"
                    disabled={!selectedDate || isLoadingHorarios}
                    id="time"
                    name="time"
                    onChange={(event) => updateField("time", event.target.value)}
                    required
                    value={formValues.time}
                  >
                    <option value="">
                      {getTimePlaceholder({
                        isLoadingHorarios,
                        selectedDate,
                        selectedProfesional,
                      })}
                    </option>
                    {visibleHorarios.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              {selectedDate && !isLoadingHorarios && visibleHorarios.length === 0 ? (
                <p className="text-sm leading-relaxed text-on-surface-variant">
                  Sin disponibilidad para ese dia.
                </p>
              ) : null}
            </FormGroup>
          ) : null}

          {status.message ? <p className="form-error">{status.message}</p> : null}

          <div className="booking-actions">
            {currentStep > 1 ? (
              <button className="button-secondary w-full sm:w-fit" onClick={goBack} type="button">
                Volver
              </button>
            ) : null}
            {currentStep < 3 ? (
              <button className="button-primary w-full sm:w-fit" onClick={goNext} type="button">
                Siguiente
              </button>
            ) : (
              <button
                className="button-primary w-full sm:w-fit"
                disabled={isSubmitting || !canSubmit()}
                type="submit"
              >
                {isSubmitting ? "Enviando..." : "Reservar ahora"}
              </button>
            )}
          </div>
        </form>
      </div>

      <aside className="policies-contact home-studio-contact" data-reveal>
        <p className="text-label uppercase text-tertiary">¿Tenés alguna duda?</p>
        <h2>Estamos para ayudarte</h2>
        <p>Podés comunicarte con el estudio antes de reservar o modificar un turno existente.</p>
        <a href="https://www.instagram.com/moonstudio.ok/" rel="noreferrer" target="_blank">
          Contactar al estudio
        </a>
      </aside>

      {bookingConfirmation ? (
        <div
          aria-labelledby="booking-confirmation-title"
          aria-modal="true"
          className="profile-modal-backdrop booking-confirmation-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setBookingConfirmation(null);
          }}
          role="dialog"
        >
          <div className="booking-confirmation-modal">
            <p className="text-label uppercase text-tertiary">Reserva confirmada</p>
            <h2 id="booking-confirmation-title">Turno agendado con éxito</h2>
            <div className="booking-confirmation-details">
              <div>
                <span>Profesional</span>
                <strong>{bookingConfirmation.profesional}</strong>
              </div>
              <div>
                <span>Servicio</span>
                <strong>{bookingConfirmation.servicio}</strong>
              </div>
              <div>
                <span>Fecha</span>
                <strong>{formatBookingDate(bookingConfirmation.fecha)}</strong>
              </div>
              <div>
                <span>Horario</span>
                <strong>{bookingConfirmation.hora} hs</strong>
              </div>
            </div>
            <p className="booking-confirmation-note">
              Tu turno ya quedó registrado. De requerir una atención especial o personalizada,
              podrás compartir los detalles con la profesional cuando se comunique.
            </p>
            <button
              autoFocus
              className="button-primary booking-confirmation-button"
              onClick={() => setBookingConfirmation(null)}
              type="button"
            >
              OK
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function StepIndicator({ currentStep, number, title }) {
  const isActive = currentStep === number;
  const isDone = currentStep > number;

  return (
    <div
      className={`booking-step ${isActive ? "booking-step-active" : ""} ${
        isDone ? "booking-step-done" : ""
      }`}
    >
      <span>{number}</span>
      <strong>{title}</strong>
    </div>
  );
}

function FormGroup({ children, title }) {
  return (
    <fieldset className="mb-10 space-y-6">
      <legend className="w-full border-b border-outline-variant/40 pb-3 font-display text-3xl text-secondary">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

function Field({
  autoComplete,
  error,
  id,
  inputMode,
  label,
  maxLength,
  onChange,
  placeholder,
  required,
  type = "text",
  value,
  variant,
}) {
  return (
    <label className="block">
      <span className="form-label">{label}</span>
      <input
        aria-invalid={error ? "true" : "false"}
        autoComplete={autoComplete}
        className={`form-input ${variant === "boxed" ? "form-input-boxed" : ""}`}
        id={id}
        inputMode={inputMode}
        maxLength={maxLength}
        name={id}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        type={type}
        value={value}
      />
      {error ? <span className="field-error">{error}</span> : null}
    </label>
  );
}

function sanitizeFieldValue(name, value) {
  if (name === "name") return value.replace(/[^A-Za-zÀ-ÿÑñ\s]/g, "").slice(0, 80);
  if (name === "phone") return normalizePhone(value);
  if (name === "email") return value.trim().toLowerCase().slice(0, 120);
  return value;
}

function normalizeName(value) {
  return value.trim().replace(/\s+/g, " ");
}

function normalizeEmail(value) {
  return value.trim().toLowerCase();
}

function normalizePhone(value) {
  return value.replace(/\D/g, "").slice(0, 12);
}

function validateClientData(values) {
  const errors = {};
  const name = normalizeName(values.name);
  const email = normalizeEmail(values.email);
  const phone = normalizePhone(values.phone);
  const emailDomain = email.split("@")[1];

  if (!NAME_REGEX.test(name)) {
    errors.name = "Ingresa nombre y apellido, solo letras y espacios.";
  }

  if (!EMAIL_REGEX.test(email) || !ALLOWED_EMAIL_DOMAINS.has(emailDomain)) {
    errors.email = "Usa un correo valido, por ejemplo Gmail, Hotmail u Outlook.";
  }

  if (!PHONE_REGEX.test(phone)) {
    errors.phone = "Ingresa solo numeros, entre 7 y 12 digitos.";
  }

  return errors;
}

function formatServiceOption(service, professionalNames = []) {
  const price = formatServicePrice(service);
  const serviceLabel =
    price === "Precio a consultar" ? service.nombre : `${service.nombre} - ${price}`;
  const professionalsLabel = professionalNames.length
    ? ` - ${formatProfessionalList(professionalNames)}`
    : "";

  return `${serviceLabel}${professionalsLabel}`;
}

function formatProfessionalList(professionalNames = []) {
  if (professionalNames.length <= 2) return professionalNames.join(" y ");
  return `${professionalNames.slice(0, -1).join(", ")} y ${professionalNames.at(-1)}`;
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

function formatBookingDate(value) {
  const [year, month, day] = String(value).split("-");
  const date = new Date(Number(year), Number(month) - 1, Number(day), 12);

  return new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function buildDateOptions(totalDays) {
  return Array.from({ length: totalDays }, (_item, index) => {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() + index);
    const weekday = new Intl.DateTimeFormat("es-AR", { weekday: "short" })
      .format(date)
      .replace(".", "");
    const dayMonth = new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "2-digit",
    }).format(date);

    return {
      value: toDateInputValue(date),
      label: `${weekday} ${dayMonth}`,
    };
  });
}

function toDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getTimePlaceholder({ isLoadingHorarios, selectedDate, selectedProfesional }) {
  if (!selectedProfesional) return "Selecciona servicio y profesional primero";
  if (!selectedDate) return "Selecciona un dia primero";
  if (isLoadingHorarios) return "Cargando horarios";
  return "Selecciona una hora";
}
