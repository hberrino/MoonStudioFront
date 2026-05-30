import { useEffect, useRef, useState } from "react";
import { team } from "../data/team.js";

const AUTO_SLIDE_MS = 2400;

function advanceCarousel(carousel) {
  if (!carousel) return;

  const maxScroll = carousel.scrollWidth - carousel.clientWidth;
  if (maxScroll <= 0) return;

  const isAtEnd = carousel.scrollLeft >= maxScroll - 8;
  carousel.scrollTo({
    left: isAtEnd ? 0 : carousel.scrollLeft + carousel.clientWidth,
    behavior: "smooth",
  });
}

export default function About() {
  const [selectedPerson, setSelectedPerson] = useState(null);
  const teamCarouselRef = useRef(null);
  const workCarouselRef = useRef(null);

  const moveTeamCarousel = (direction) => {
    const carousel = teamCarouselRef.current;
    if (!carousel) return;

    carousel.scrollBy({
      left: direction * carousel.clientWidth,
      behavior: "smooth",
    });
  };

  const moveWorkCarousel = (direction) => {
    const carousel = workCarouselRef.current;
    if (!carousel) return;

    carousel.scrollBy({
      left: direction * carousel.clientWidth,
      behavior: "smooth",
    });
  };

  const closeProfile = () => {
    setSelectedPerson(null);
  };

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      advanceCarousel(teamCarouselRef.current);
    }, AUTO_SLIDE_MS);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!selectedPerson) return undefined;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeProfile();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedPerson]);

  useEffect(() => {
    if (selectedPerson && workCarouselRef.current) {
      workCarouselRef.current.scrollTo({ left: 0 });
    }
  }, [selectedPerson]);

  useEffect(() => {
    if (!selectedPerson) return undefined;

    const intervalId = window.setInterval(() => {
      advanceCarousel(workCarouselRef.current);
    }, AUTO_SLIDE_MS);

    return () => window.clearInterval(intervalId);
  }, [selectedPerson]);

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

      <div className="team-stage">
        <button
          aria-label="Ver profesionales anteriores"
          className="carousel-button carousel-button-left"
          onClick={() => moveTeamCarousel(-1)}
          type="button"
        >
          {"<"}
        </button>
        <div
          className="team-carousel flex gap-5 overflow-x-auto scroll-smooth"
          ref={teamCarouselRef}
        >
          {team.map((person) => (
            <article
              className="team-slide flex h-full flex-col rounded-lg border border-outline-variant/40 bg-surface-container-low p-5 text-center shadow-halo transition duration-500 hover:-translate-y-1"
              key={person.id}
            >
              <div className="arch-image mb-6 h-80 overflow-hidden bg-tertiary-fixed">
                <img
                  alt={`Retrato de ${person.name}`}
                  className="h-full w-full object-cover opacity-90 mix-blend-multiply"
                  src={person.image}
                />
              </div>
              <h3 className="font-display text-3xl text-primary">{person.name}</h3>
              <span className="mt-3 inline-flex w-fit self-center rounded-full border border-secondary/20 bg-secondary/10 px-4 py-1 text-label uppercase text-secondary">
                {person.role}
              </span>
              <p className="mt-4 flex-1 leading-relaxed text-on-surface-variant">{person.bio}</p>
              <button
                className="button-primary mt-6 w-full"
                onClick={() => setSelectedPerson(person)}
                type="button"
              >
                Ver perfil
              </button>
            </article>
          ))}
        </div>
        <button
          aria-label="Ver mas profesionales"
          className="carousel-button carousel-button-right"
          onClick={() => moveTeamCarousel(1)}
          type="button"
        >
          {">"}
        </button>
        <div className="carousel-mobile-controls">
          <button
            aria-label="Ver profesional anterior"
            className="carousel-button"
            onClick={() => moveTeamCarousel(-1)}
            type="button"
          >
            {"<"}
          </button>
          <button
            aria-label="Ver siguiente profesional"
            className="carousel-button"
            onClick={() => moveTeamCarousel(1)}
            type="button"
          >
            {">"}
          </button>
        </div>
      </div>

      {selectedPerson ? (
        <div
          className="profile-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeProfile();
            }
          }}
        >
          <article
            aria-labelledby="profile-modal-title"
            aria-modal="true"
            className="profile-modal"
            role="dialog"
          >
            <button
              aria-label="Cerrar perfil"
              className="profile-modal-close"
              onClick={closeProfile}
              type="button"
            >
              x
            </button>

            <div className="profile-modal-grid">
              <div className="profile-modal-copy">
                <p className="text-label uppercase text-tertiary">{selectedPerson.profession}</p>
                <h3 id="profile-modal-title">{selectedPerson.name}</h3>
                <span>{selectedPerson.role}</span>
                <p>{selectedPerson.bio}</p>
              </div>

              <div className="profile-work-stage">
                <p className="profile-work-title">Algunos de mis ultimos trabajos!</p>
                <button
                  aria-label="Ver trabajo anterior"
                  className="carousel-button profile-work-button profile-work-button-left"
                  onClick={() => moveWorkCarousel(-1)}
                  type="button"
                >
                  {"<"}
                </button>
                <div className="profile-work-carousel" ref={workCarouselRef}>
                  {selectedPerson.workImages.map((image, index) => (
                    <figure className="profile-work-slide" key={`${selectedPerson.id}-${image}`}>
                      <img
                        alt={`Trabajo ${index + 1} de ${selectedPerson.name}`}
                        src={image}
                      />
                    </figure>
                  ))}
                </div>
                <button
                  aria-label="Ver siguiente trabajo"
                  className="carousel-button profile-work-button profile-work-button-right"
                  onClick={() => moveWorkCarousel(1)}
                  type="button"
                >
                  {">"}
                </button>
                <div className="profile-modal-actions">
                  <a
                    className="profile-action-link"
                    href={selectedPerson.instagram}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <img
                      alt=""
                      aria-hidden="true"
                      className="profile-action-icon"
                      src="/icons/icons8-instagram-48.png"
                    />
                    Instagram
                  </a>
                  <a
                    className="profile-action-link"
                    href="#reservar"
                    onClick={closeProfile}
                  >
                    <img
                      alt=""
                      aria-hidden="true"
                      className="profile-action-icon"
                      src="/icons/icons8-calendario-48.png"
                    />
                    Reservar
                  </a>
                </div>
              </div>
            </div>
          </article>
        </div>
      ) : null}

      <div className="mt-20 grid items-center gap-10 border-t border-outline-variant/50 pt-16 md:grid-cols-2">
        <div>
          <h3 className="font-display text-4xl text-primary md:text-5xl">
          Ejemplo: La filosofia del tacto
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
