import { useEffect, useRef, useState } from "react";
import ProgressiveImage from "../components/ProgressiveImage.jsx";
import { team } from "../data/team.js";

const WORK_AUTO_SLIDE_MS = 3000;
const SPACE_AUTO_SLIDE_MS = 2400;
const TEAM_MOBILE_SLIDE_MS = 3000;
const TEAM_SCROLL_SPEED = 28;
const spaceImages = [
  "/images/espacio/espacio1.jpg",
  "/images/espacio/espacio2.jpg",
  "/images/espacio/espacio3.jpg",
  "/images/espacio/espacio4.jpg",
  "/images/espacio/espacio5.jpg",
  "/images/espacio/espacio6.jpg",
  "/images/espacio/espacio7.jpg",
  "/images/espacio/espacio8.jpg",
  "/images/espacio/espacio9.jpg",
  "/images/espacio/espacio10.jpg",
];

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

function preloadImage(src) {
  return new Promise((resolve) => {
    if (!src) {
      resolve();
      return;
    }

    const image = new Image();
    image.onload = resolve;
    image.onerror = resolve;
    image.src = src;
  });
}

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export default function About() {
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [isSpaceModalOpen, setIsSpaceModalOpen] = useState(false);
  const [spaceModalView, setSpaceModalView] = useState("studio");
  const [pendingModal, setPendingModal] = useState("");
  const teamCarouselRef = useRef(null);
  const teamScrollPositionRef = useRef(0);
  const teamMobileIndexRef = useRef(0);
  const isTeamMobileRef = useRef(false);
  const isTeamPausedRef = useRef(false);
  const workCarouselRef = useRef(null);
  const spaceCarouselRef = useRef(null);
  const modalRequestRef = useRef(0);

  const moveWorkCarousel = (direction) => {
    const carousel = workCarouselRef.current;
    if (!carousel) return;

    carousel.scrollBy({
      left: direction * carousel.clientWidth,
      behavior: "smooth",
    });
  };

  const moveTeamMobile = (direction) => {
    const carousel = teamCarouselRef.current;
    if (!carousel) return;

    const nextIndex = (teamMobileIndexRef.current + direction + team.length) % team.length;
    const slide = carousel.querySelector(`[data-team-index="${nextIndex}"]`);
    if (!slide) return;

    teamMobileIndexRef.current = nextIndex;
    carousel.scrollTo({ left: slide.offsetLeft, behavior: "smooth" });
  };

  const moveSpaceCarousel = (direction) => {
    const carousel = spaceCarouselRef.current;
    if (!carousel) return;

    carousel.scrollBy({
      left: direction * carousel.clientWidth,
      behavior: "smooth",
    });
  };

  const closeProfile = () => {
    modalRequestRef.current += 1;
    setPendingModal("");
    setSelectedPerson(null);
  };

  const closeSpaceModal = () => {
    modalRequestRef.current += 1;
    setPendingModal("");
    setIsSpaceModalOpen(false);
  };

  const openProfile = (person) => {
    const requestId = modalRequestRef.current + 1;
    modalRequestRef.current = requestId;
    setPendingModal("profile");

    Promise.all([
      Promise.race([
        Promise.all([preloadImage(person.image), preloadImage(person.workImages[0])]),
        wait(900),
      ]),
      wait(260),
    ]).then(() => {
      if (modalRequestRef.current !== requestId) return;
      setSelectedPerson(person);
      setPendingModal("");
    });
  };

  const openSpaceModal = (view) => {
    const requestId = modalRequestRef.current + 1;
    const firstImage = view === "map" ? "/images/espacio/map.jpg" : spaceImages[0];
    modalRequestRef.current = requestId;
    setPendingModal("space");

    Promise.all([Promise.race([preloadImage(firstImage), wait(900)]), wait(260)]).then(() => {
      if (modalRequestRef.current !== requestId) return;
      setSpaceModalView(view);
      setIsSpaceModalOpen(true);
      setPendingModal("");
    });
  };

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return undefined;

    const mobileQuery = window.matchMedia("(max-width: 767px)");
    const updateMode = () => {
      isTeamMobileRef.current = mobileQuery.matches;
    };

    updateMode();
    mobileQuery.addEventListener("change", updateMode);

    let animationFrameId;
    let previousTime = performance.now();

    const moveContinuously = (currentTime) => {
      const carousel = teamCarouselRef.current;
      const elapsed = Math.min(currentTime - previousTime, 50);
      previousTime = currentTime;

      if (
        carousel &&
        carousel.scrollWidth > carousel.clientWidth &&
        !isTeamMobileRef.current &&
        !isTeamPausedRef.current
      ) {
        const firstDuplicate = carousel.querySelector('[data-team-copy="true"]');
        const loopPoint = firstDuplicate?.offsetLeft || carousel.scrollWidth / 2;
        teamScrollPositionRef.current += (TEAM_SCROLL_SPEED * elapsed) / 1000;

        if (teamScrollPositionRef.current >= loopPoint) {
          teamScrollPositionRef.current -= loopPoint;
        }

        carousel.scrollLeft = teamScrollPositionRef.current;
      }

      animationFrameId = window.requestAnimationFrame(moveContinuously);
    };

    animationFrameId = window.requestAnimationFrame(moveContinuously);

    return () => {
      mobileQuery.removeEventListener("change", updateMode);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (isTeamMobileRef.current && !isTeamPausedRef.current) {
        moveTeamMobile(1);
      }
    }, TEAM_MOBILE_SLIDE_MS);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!selectedPerson && !isSpaceModalOpen && !pendingModal) return undefined;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeProfile();
        closeSpaceModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedPerson, isSpaceModalOpen, pendingModal]);

  useEffect(() => {
    if (selectedPerson && workCarouselRef.current) {
      workCarouselRef.current.scrollTo({ left: 0 });
    }
  }, [selectedPerson]);

  useEffect(() => {
    if (!selectedPerson) return undefined;

    const intervalId = window.setInterval(() => {
      advanceCarousel(workCarouselRef.current);
    }, WORK_AUTO_SLIDE_MS);

    return () => window.clearInterval(intervalId);
  }, [selectedPerson]);

  useEffect(() => {
    if (!isSpaceModalOpen) return undefined;

    spaceCarouselRef.current?.scrollTo({ left: 0 });
    const intervalId = window.setInterval(() => {
      advanceCarousel(spaceCarouselRef.current);
    }, SPACE_AUTO_SLIDE_MS);

    return () => window.clearInterval(intervalId);
  }, [isSpaceModalOpen]);

  return (
    <section className="section-shell" id="nosotros">
      <div className="section-heading" data-reveal>
        <h2>Equipo Moon</h2>
        <p>Conocé a quienes forman parte de Moon.</p>
      </div>

      <div
        className="team-stage"
        data-reveal
        data-reveal-delay="1"
        onBlurCapture={() => {
          isTeamPausedRef.current = false;
        }}
        onFocusCapture={() => {
          isTeamPausedRef.current = true;
        }}
        onMouseEnter={() => {
          isTeamPausedRef.current = true;
        }}
        onMouseLeave={() => {
          isTeamPausedRef.current = false;
        }}
        onTouchCancel={() => {
          isTeamPausedRef.current = false;
        }}
        onTouchEnd={() => {
          isTeamPausedRef.current = false;
        }}
        onTouchStart={() => {
          isTeamPausedRef.current = true;
        }}
      >
        <div
          className="team-carousel flex gap-5 overflow-x-auto"
          onScroll={(event) => {
            if (isTeamMobileRef.current) {
              const carousel = event.currentTarget;
              const originalSlides = Array.from(
                carousel.querySelectorAll('[data-team-copy="false"]'),
              );
              const closestSlide = originalSlides.reduce((closest, slide) =>
                Math.abs(slide.offsetLeft - carousel.scrollLeft) <
                Math.abs(closest.offsetLeft - carousel.scrollLeft)
                  ? slide
                  : closest,
              originalSlides[0]);

              if (closestSlide) {
                teamMobileIndexRef.current = Number(closestSlide.dataset.teamIndex);
              }
            } else if (isTeamPausedRef.current) {
              teamScrollPositionRef.current = event.currentTarget.scrollLeft;
            }
          }}
          ref={teamCarouselRef}
        >
          {[...team, ...team].map((person, index) => {
            const isDuplicate = index >= team.length;

            return (
            <article
              aria-hidden={isDuplicate ? "true" : undefined}
              className="team-slide flex h-full flex-col rounded-lg border border-outline-variant/40 bg-surface-container-low p-5 text-center shadow-halo transition duration-500 hover:-translate-y-1"
              data-team-copy={isDuplicate ? "true" : "false"}
              data-team-index={index % team.length}
              key={`${person.id}-${isDuplicate ? "copy" : "original"}`}
            >
              <div className="arch-image mb-6 h-80 overflow-hidden bg-tertiary-fixed">
                <ProgressiveImage
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
                onClick={() => openProfile(person)}
                onFocus={() => preloadImage(person.workImages[0])}
                onMouseEnter={() => preloadImage(person.workImages[0])}
                onTouchStart={() => preloadImage(person.workImages[0])}
                tabIndex={isDuplicate ? -1 : undefined}
                type="button"
              >
                Ver perfil
              </button>
            </article>
            );
          })}
        </div>
        <div className="team-mobile-controls">
          <button
            aria-label="Ver profesional anterior"
            className="carousel-button"
            onClick={() => moveTeamMobile(-1)}
            type="button"
          >
            {"<"}
          </button>
          <button
            aria-label="Ver siguiente profesional"
            className="carousel-button"
            onClick={() => moveTeamMobile(1)}
            type="button"
          >
            {">"}
          </button>
        </div>
      </div>

      {pendingModal ? (
        <div className="profile-modal-backdrop" aria-live="polite">
          <div className="modal-preloader" role="status">
            <div className="modal-preloader-brand">
              <span>Moon</span>
              <strong>Studio</strong>
            </div>
            <span className="modal-preloader-line" />
          </div>
        </div>
      ) : null}

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
                      <ProgressiveImage
                        alt={`Trabajo ${index + 1} de ${selectedPerson.name}`}
                        eager={index === 0}
                        instant={index === 0}
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

      <div
        className="mt-20 grid items-center gap-10 border-t border-outline-variant/50 pt-16 md:grid-cols-2"
        data-reveal
        id="espacio"
      >
        <div>
          <div className="space-preview-copy">
            <div className="space-preview-mark">
              <span>Moon</span>
              <strong>Studio</strong>
            </div>
            <h3>Conoce nuestro espacio</h3>
          </div>
          <p className="mt-5 text-lg leading-relaxed text-on-surface-variant">
            Creamos un espacio tranquilo, cuidado y calido, donde cada visita se
            vive con calma. Porque la tecnica importa, pero tambien importa como
            te sentis durante el proceso.
          </p>
          <div className="space-preview-actions mt-7">
            <button
              className="space-link-button"
              onFocus={() => preloadImage(spaceImages[0])}
              onMouseEnter={() => preloadImage(spaceImages[0])}
              onClick={() => openSpaceModal("studio")}
              type="button"
            >
              {">>"} Ver estudio {"<<"}
            </button>
            <button
              className="space-link-button space-mobile-directions"
              onFocus={() => preloadImage("/images/espacio/map.jpg")}
              onMouseEnter={() => preloadImage("/images/espacio/map.jpg")}
              onClick={() => openSpaceModal("map")}
              type="button"
            >
              {">>"} Como llegar {"<<"}
            </button>
          </div>
        </div>
        <div className="h-80 overflow-hidden rounded-lg border border-outline-variant/40 bg-surface-container shadow-halo md:h-96">
          <ProgressiveImage
            alt="Detalle del estudio"
            className="h-full w-full object-cover opacity-85"
            src="/images/espacio/estudioprincipal.jpg"
          />
        </div>
      </div>

      {isSpaceModalOpen ? (
        <div
          className="profile-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeSpaceModal();
            }
          }}
        >
          <article
            aria-labelledby="space-modal-title"
            aria-modal="true"
            className="space-modal"
            data-space-view={spaceModalView}
            role="dialog"
          >
            <button
              aria-label="Cerrar estudio"
              className="profile-modal-close"
              onClick={closeSpaceModal}
              type="button"
            >
              x
            </button>
            <div className="space-modal-copy">
              <p className="text-label uppercase text-tertiary" id="space-modal-title">
                Moon Studio
              </p>
            </div>
            <div className="space-modal-content">
              <div className="space-gallery-stage">
                <button
                  aria-label="Ver foto anterior del estudio"
                  className="space-gallery-button space-gallery-button-left"
                  onClick={() => moveSpaceCarousel(-1)}
                  type="button"
                >
                  {"<"}
                </button>
                <div className="space-gallery-carousel" ref={spaceCarouselRef}>
                  {spaceImages.map((image, index) => (
                    <figure className="space-gallery-slide" key={image}>
                      <ProgressiveImage
                        alt={`Espacio Moon Studio ${index + 1}`}
                        eager={index === 0}
                        instant={index === 0}
                        src={image}
                      />
                    </figure>
                  ))}
                </div>
                <button
                  aria-label="Ver siguiente foto del estudio"
                  className="space-gallery-button space-gallery-button-right"
                  onClick={() => moveSpaceCarousel(1)}
                  type="button"
                >
                  {">"}
                </button>
              </div>

              <div className="space-map-panel">
                <a
                  aria-label="Abrir ubicación de Moon Studio en Google Maps"
                  className="space-map-preview"
                  href="https://maps.app.goo.gl/AZtYP6Tehpoy4RqC7"
                  rel="noreferrer"
                  target="_blank"
                >
                  <ProgressiveImage
                    alt="Mapa de ubicación de Moon Studio"
                    eager
                    instant
                    src="/images/espacio/map.jpg"
                  />
                </a>
                <a
                  className="space-maps-link"
                  href="https://maps.app.goo.gl/AZtYP6Tehpoy4RqC7"
                  rel="noreferrer"
                  target="_blank"
                >
                  {">>"} Ver en Google Maps {"<<"}
                </a>
              </div>
            </div>
          </article>
        </div>
      ) : null}
    </section>
  );
}
