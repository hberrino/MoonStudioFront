import { useCallback, useEffect, useRef } from "react";
import { services } from "../data/services.js";

export default function Services() {
  const carouselRef = useRef(null);
  const currentIndexRef = useRef(0);
  const isPausedRef = useRef(false);

  const goToService = useCallback((index) => {
    const carousel = carouselRef.current;
    const nextIndex = (index + services.length) % services.length;
    const slide = carousel?.querySelector(`[data-service-index="${nextIndex}"]`);

    if (!carousel || !slide) return;

    currentIndexRef.current = nextIndex;
    carousel.scrollTo({
      left: slide.offsetLeft,
      behavior: "smooth",
    });
  }, [services.length]);

  const moveCarousel = useCallback((direction) => {
    goToService(currentIndexRef.current + direction);
  }, [goToService]);

  const syncCurrentSlide = () => {
    const carousel = carouselRef.current;

    if (!carousel) return;

    const slides = Array.from(carousel.querySelectorAll(".service-slide"));
    const nextIndex = slides.reduce((closestIndex, slide, index) => {
      const closestSlide = slides[closestIndex];

      return Math.abs(slide.offsetLeft - carousel.scrollLeft) <
        Math.abs(closestSlide.offsetLeft - carousel.scrollLeft)
        ? index
        : closestIndex;
    }, 0);

    currentIndexRef.current = nextIndex;
  };

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) return undefined;

    const interval = window.setInterval(() => {
      if (!isPausedRef.current) {
        moveCarousel(1);
      }
    }, 4600);

    return () => window.clearInterval(interval);
  }, [moveCarousel]);

  return (
    <section className="section-shell" id="servicios">
      <div className="section-heading">
        <p className="text-label uppercase text-tertiary">Servicios</p>
        <h2>Nuestros Servicios</h2>
        <p>
          Una seleccion personalizada de experiencias para cabello, mirada y
          manos.
        </p>
      </div>

      <div
        className="services-stage"
        onMouseEnter={() => {
          isPausedRef.current = true;
        }}
        onMouseLeave={() => {
          isPausedRef.current = false;
        }}
        onTouchStart={() => {
          isPausedRef.current = true;
        }}
      >
        <button
          aria-label="Servicio anterior"
          className="carousel-button carousel-button-left"
          onClick={() => moveCarousel(-1)}
          type="button"
        >
          {"<"}
        </button>

        <div
          className="services-carousel flex snap-x snap-mandatory overflow-x-auto scroll-smooth"
          onScroll={syncCurrentSlide}
          ref={carouselRef}
        >
          {services.map((service, index) => (
            <ServiceCard index={index} key={service.id} service={service} />
          ))}
        </div>

        <button
          aria-label="Servicio siguiente"
          className="carousel-button carousel-button-right"
          onClick={() => moveCarousel(1)}
          type="button"
        >
          {">"}
        </button>
      </div>

      <div className="carousel-mobile-controls">
        <button
          aria-label="Servicio anterior"
          className="carousel-button"
          onClick={() => moveCarousel(-1)}
          type="button"
        >
          {"<"}
        </button>
        <button
          aria-label="Servicio siguiente"
          className="carousel-button"
          onClick={() => moveCarousel(1)}
          type="button"
        >
          {">"}
        </button>
      </div>
    </section>
  );
}

function ServiceCard({ index, service }) {
  return (
    <article
      className="service-slide grid snap-start gap-6 rounded-lg border border-outline-variant/40 bg-surface-container-low p-5 shadow-halo md:grid-cols-2 md:gap-8 md:p-9"
      data-service-index={index}
    >
      <div className="service-slide-media overflow-hidden rounded-lg">
        <img
          alt=""
          className="h-full w-full object-cover transition duration-700 hover:scale-105"
          src={service.image}
        />
      </div>
      <div className="flex flex-col justify-center">
        <Pill>{service.category}</Pill>
        <h3 className="mt-5 font-display text-[clamp(2.25rem,8vw,3.35rem)] leading-none text-primary">
          {service.title}
        </h3>
        <p className="mt-4 text-base leading-relaxed text-on-surface-variant md:text-lg">
          {service.description}
        </p>
        <div className="mt-8 flex flex-col gap-5 border-t border-outline-variant/50 pt-5">
          <p className="text-label uppercase text-tertiary">
            Profesional
            <br />
            {service.professional}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <a className="button-secondary w-full sm:w-fit" href="#nosotros">
              Ver perfil
            </a>
            <a className="button-primary w-full sm:w-fit" href="#reservar">
              Reservar cita
            </a>
          </div>
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
