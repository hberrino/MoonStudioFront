import { team } from "../data/team.js";

export default function About() {
  return (
    <section className="section-shell" id="nosotros">
      <div className="section-heading">
        <p className="text-label uppercase text-tertiary">Nosotros</p>
        <h2>El equipo Moon</h2>
        <p>
          Profesionales con una mirada calma, precisa y cercana. Estos datos son
          inventados para que puedas reemplazarlos por el equipo real.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {team.map((person, index) => (
          <article
            className="rounded-lg border border-outline-variant/40 bg-surface-container-low p-5 text-center shadow-halo transition duration-500 hover:-translate-y-1"
            key={person.id}
            style={{ marginTop: index ? `${index * 28}px` : undefined }}
          >
            <div className="arch-image mb-6 h-80 overflow-hidden bg-tertiary-fixed">
              <img
                alt={`Retrato de ${person.name}`}
                className="h-full w-full object-cover opacity-90 mix-blend-multiply"
                src={person.image}
              />
            </div>
            <h3 className="font-display text-3xl text-primary">{person.name}</h3>
            <span className="mt-3 inline-flex rounded-full border border-secondary/20 bg-secondary/10 px-4 py-1 text-label uppercase text-secondary">
              {person.role}
            </span>
            <p className="mt-4 leading-relaxed text-on-surface-variant">{person.bio}</p>
          </article>
        ))}
      </div>

      <div className="mt-20 grid items-center gap-10 border-t border-outline-variant/50 pt-16 md:grid-cols-2">
        <div>
          <h3 className="font-display text-4xl text-primary md:text-5xl">
            La filosofia del tacto
          </h3>
          <p className="mt-5 text-lg leading-relaxed text-on-surface-variant">
            Creamos un espacio donde cada visita se sienta tranquila, cuidada y
            simple. La tecnica importa, pero tambien importa como te sentis en
            el proceso.
          </p>
          <a className="mt-7 inline-flex border-b border-primary pb-1 text-label uppercase text-primary" href="#servicios">
            Descubre nuestros servicios
          </a>
        </div>
        <div className="h-80 overflow-hidden rounded-lg border border-outline-variant/40 bg-surface-container shadow-halo md:h-96">
          <img
            alt="Detalle del estudio"
            className="h-full w-full object-cover opacity-85"
            src="https://images.unsplash.com/photo-1604014238170-4def1e4e6fcf?q=80&w=1400&auto=format&fit=crop"
          />
        </div>
      </div>
    </section>
  );
}
