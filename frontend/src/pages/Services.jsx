import { useCallback, useEffect, useRef, useState } from "react";
import ProgressiveImage from "../components/ProgressiveImage.jsx";
import { services } from "../data/services.js";

const SERVICE_AUTO_SLIDE_MS = 3000;

export default function Services() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef(null);
  const currentIndexRef = useRef(0);
  const isPausedRef = useRef(false);

  const goToService = useCallback((index, behavior = "smooth") => {
    const carousel = carouselRef.current;
    const nextIndex = (index + services.length) % services.length;
    const slide = carousel?.querySelector(`[data-service-index="${nextIndex}"]`);
    if (!carousel || !slide) return;

    currentIndexRef.current = nextIndex;
    setCurrentIndex(nextIndex);
    carousel.scrollTo({ left: slide.offsetLeft, behavior });
  }, []);

  const moveCarousel = useCallback((direction) => {
    goToService(currentIndexRef.current + direction);
  }, [goToService]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return undefined;

    const intervalId = window.setInterval(() => {
      if (!isPausedRef.current) {
        moveCarousel(1);
      }
    }, SERVICE_AUTO_SLIDE_MS);

    return () => window.clearInterval(intervalId);
  }, [moveCarousel]);

  return (
    <section className="section-shell" id="servicios">
      <div className="section-heading" data-reveal>
        <p className="text-label uppercase text-tertiary">Servicios</p>
        <h2>Nuestros Servicios</h2>
        <p>
          Una seleccion personalizada de experiencias para cabello, mirada y
          manos.
        </p>
      </div>

      <div
        className="services-stage"
        data-reveal
        data-reveal-delay="1"
        onBlurCapture={() => {
          isPausedRef.current = false;
        }}
        onFocusCapture={() => {
          isPausedRef.current = true;
        }}
        onMouseEnter={() => {
          isPausedRef.current = true;
        }}
        onMouseLeave={() => {
          isPausedRef.current = false;
        }}
        onTouchStart={() => {
          isPausedRef.current = true;
        }}
        onTouchEnd={() => {
          isPausedRef.current = false;
        }}
        onTouchCancel={() => {
          isPausedRef.current = false;
        }}
      >
        <div
          className="services-carousel flex overflow-x-auto"
          onScroll={(event) => {
            const carousel = event.currentTarget;
            const slides = Array.from(carousel.querySelectorAll(".service-slide"));
            const closestSlide = slides.reduce((closest, slide) =>
              Math.abs(slide.offsetLeft - carousel.scrollLeft) <
              Math.abs(closest.offsetLeft - carousel.scrollLeft)
                ? slide
                : closest,
            slides[0]);

            if (!closestSlide) return;
            const nextIndex = Number(closestSlide.dataset.serviceIndex);
            currentIndexRef.current = nextIndex;
            setCurrentIndex(nextIndex);
          }}
          ref={carouselRef}
        >
          {services.map((service, index) => (
            <ServiceCard index={index} key={service.id} service={service} />
          ))}
        </div>

        <div className="services-controls">
          <button
            aria-label="Ver servicio anterior"
            className="services-control-button"
            onClick={() => moveCarousel(-1)}
            type="button"
          >
            {"<"}
          </button>
          <div aria-label="Seleccionar servicio" className="services-indicators">
            {services.map((service, index) => (
              <button
                aria-label={`Ver ${service.title}`}
                aria-pressed={currentIndex === index}
                className={`services-indicator${currentIndex === index ? " is-active" : ""}`}
                key={service.id}
                onClick={() => goToService(index)}
                type="button"
              />
            ))}
          </div>
          <button
            aria-label="Ver siguiente servicio"
            className="services-control-button"
            onClick={() => moveCarousel(1)}
            type="button"
          >
            {">"}
          </button>
        </div>
      </div>
    </section>
  );
}

function ServiceCard({ index, service }) {
  return (
    <article
      className="service-slide"
      data-service-index={index}
    >
      <div className="service-slide-media overflow-hidden rounded-lg">
        <ProgressiveImage
          alt={service.title}
          className="service-slide-image"
          eager={index === 0}
          src={service.image}
        />
      </div>
      <div className="service-slide-content">
        <Pill>{service.category}</Pill>
        <h3 className="mt-5 font-display text-[clamp(2.25rem,8vw,3.35rem)] leading-none text-primary">
          {service.title}
        </h3>
        <p className="mt-4 text-base leading-relaxed text-on-surface-variant md:text-lg">
          {service.description}
        </p>
        <div className="mt-8 flex flex-col gap-5 border-t border-outline-variant/50 pt-5">
          <div className="flex flex-col gap-3 sm:flex-row">
            <a
              className="button-secondary w-full sm:w-fit"
              href="#nosotros"
            >
              Ver profesionales
            </a>
            <a
              className="button-primary w-full sm:w-fit"
              href="#reservar"
            >
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
