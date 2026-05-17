import { services } from "../data/services.js";

export default function Booking() {
  return (
    <section className="section-shell" id="reservar">
      <div className="section-heading">
        <p className="text-label uppercase text-tertiary">Reservar turno</p>
        <h2>Asegura tu espacio</h2>
        <p>
          Un formulario base para recibir solicitudes. Mas adelante se puede
          conectar a WhatsApp, email, Google Calendar o una API.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-12">
        <div className="hidden md:col-span-5 md:block">
          <div className="arch-image h-full min-h-[640px] overflow-hidden border border-outline-variant/40 bg-surface-container-low shadow-halo">
            <img
              alt="Interior sereno de Moon Studio"
              className="h-full w-full object-cover opacity-90"
              src="https://images.unsplash.com/photo-1600334129128-685c5582fd35?q=80&w=1200&auto=format&fit=crop"
            />
          </div>
        </div>

        <form className="rounded-lg border border-outline-variant/30 bg-surface-bright/70 p-6 shadow-halo backdrop-blur-sm md:col-span-7 md:p-10">
          <FormGroup title="Tus datos">
            <Field id="name" label="Nombre completo" placeholder="Ej. Sofia Rossi" required />
            <div className="grid gap-6 md:grid-cols-2">
              <Field id="email" label="Correo electronico" placeholder="correo@ejemplo.com" type="email" required />
              <Field id="phone" label="Telefono" placeholder="+54 11 1234-5678" type="tel" required />
            </div>
          </FormGroup>

          <FormGroup title="Servicio">
            <div className="flex flex-wrap gap-3">
              {services.map((service) => (
                <label className="cursor-pointer" key={service.id}>
                  <input className="peer sr-only" name="service" required type="radio" value={service.id} />
                  <span className="inline-flex rounded-full border border-outline-variant px-4 py-3 text-sm text-on-surface-variant transition peer-checked:border-secondary peer-checked:bg-secondary/10 peer-checked:text-secondary">
                    {service.title}
                  </span>
                </label>
              ))}
            </div>
          </FormGroup>

          <FormGroup title="Fecha y hora">
            <div className="grid gap-6 md:grid-cols-2">
              <Field id="date" label="Dia" type="date" required variant="boxed" />
              <label className="block">
                <span className="form-label">Horario preferido</span>
                <select className="form-input form-input-boxed" id="time" name="time" required>
                  <option value="">Selecciona una hora</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:30">11:30 AM</option>
                  <option value="14:00">02:00 PM</option>
                  <option value="16:00">04:00 PM</option>
                  <option value="17:30">05:30 PM</option>
                </select>
              </label>
            </div>
          </FormGroup>

          <div className="rounded-lg border border-secondary-fixed-dim/40 bg-secondary-container/25 p-5">
            <p className="text-label uppercase text-primary">Politica de sena</p>
            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
              Para confirmar el turno se puede solicitar una sena. Este texto
              queda listo para adaptar a la politica real del estudio.
            </p>
          </div>

          <button className="button-primary mt-8 w-full" type="submit">
            Reservar ahora
          </button>
        </form>
      </div>
    </section>
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

function Field({ id, label, placeholder, required, type = "text", variant }) {
  return (
    <label className="block">
      <span className="form-label">{label}</span>
      <input
        className={`form-input ${variant === "boxed" ? "form-input-boxed" : ""}`}
        id={id}
        name={id}
        placeholder={placeholder}
        required={required}
        type={type}
      />
    </label>
  );
}
