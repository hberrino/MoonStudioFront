const heroVideo = "/videos/nuevaintro.mp4";

export default function Home() {
  return (
    <section
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden px-5 py-28 text-center"
      id="inicio"
    >
      <video
        aria-label="Video ambiente de Moon Studio"
        autoPlay
        className="absolute inset-0 h-full w-full object-cover"
        loop
        muted
        playsInline
        poster="/images/logo/moon-studio-hero.jpg"
        preload="metadata"
      >
        <source src={heroVideo} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/48" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_34%),linear-gradient(180deg,rgba(0,0,0,0.2),rgba(0,0,0,0.58))]" />

      <div className="hero-content relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center">
        <p className="hero-eyebrow mb-5 text-label uppercase text-white/80">Beauty studio</p>
        <h1 className="hero-title font-display text-[clamp(4.2rem,18vw,9.5rem)] leading-[0.9] tracking-normal text-[#f2e0c8] drop-shadow-[0_8px_28px_rgba(0,0,0,0.35)]">
          MOON STUDIO
        </h1>
        <p className="hero-description mt-7 max-w-3xl text-balance text-base font-medium uppercase leading-relaxed text-white/88 md:text-lg">
          Un espacio de belleza serena, detalle fino y rituales pensados para
          bajar el ritmo desde que entras.
        </p>
        <div className="hero-actions mt-10 flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
          <a className="button-primary" href="#reservar">
            Reservar turnos
          </a>
          <a className="button-secondary button-secondary-on-dark" href="#servicios">
            Ver servicios
          </a>
        </div>
      </div>

      <a
        className="absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3 whitespace-nowrap text-label uppercase text-white/82"
        href="#servicios"
      >
        Desliza
        <span className="scroll-arrow" aria-hidden="true" />
      </a>
    </section>
  );
}
