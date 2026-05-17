import { services } from "../data/services.js";

export default function Services() {
  return (
    <section className="section-shell" id="servicios">
      <div className="section-heading">
        <p className="text-label uppercase text-tertiary">Servicios</p>
        <h2>Nuestros Servicios</h2>
        <p>
          Una primera seleccion de experiencias para cabello, mirada y manos.
          Luego podes cambiar nombres, fotos, precios o duraciones desde datos.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {services.map((service, index) => (
          <ServiceCard key={service.id} reverse={index % 2 === 1} service={service} />
        ))}
      </div>
    </section>
  );
}

function ServiceCard({ reverse = false, service }) {
  return (
    <article className="grid gap-7 rounded-lg border border-outline-variant/40 bg-surface-container-low p-5 shadow-halo md:grid-cols-2 md:p-10">
      <div
        className={`min-h-[300px] overflow-hidden rounded-lg md:min-h-[420px] ${
          reverse ? "md:order-2" : ""
        }`}
      >
        <img
          alt=""
          className="h-full w-full object-cover transition duration-700 hover:scale-105"
          src={service.image}
        />
      </div>
      <div className="flex flex-col justify-center">
        <Pill>{service.category}</Pill>
        <h3 className="mt-5 font-display text-4xl text-primary md:text-5xl">{service.title}</h3>
        <p className="mt-4 text-lg leading-relaxed text-on-surface-variant">
          {service.description}
        </p>
        <div className="mt-8 flex flex-col gap-5 border-t border-outline-variant/50 pt-5 sm:flex-row sm:items-end sm:justify-between">
          <p className="text-label uppercase text-tertiary">
            Profesional
            <br />
            {service.professional}
          </p>
          <a className="button-primary w-full sm:w-fit" href="#reservar">
            Reservar cita
          </a>
        </div>
      </div>
    </article>
  );
}

function Pill({ children }) {
  return (
    <span className="inline-flex w-fit rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 text-label uppercase text-secondary">
      {children}
    </span>
  );
}
