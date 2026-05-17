const heroImage = "/images/moon-studio-lobby.jpg";

export default function Home() {
  return (
    <section
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden px-5 pb-24 pt-28"
      id="inicio"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_24%,rgba(244,223,203,0.65),transparent_34%),linear-gradient(180deg,#fbf9f4_0%,#f0eee9_100%)]" />

      <div className="relative z-10 grid w-full max-w-container items-center gap-8 md:grid-cols-[0.72fr_1fr] md:gap-12">
        <div className="order-2 text-center md:order-1 md:text-left">
          <p className="mb-4 text-label uppercase text-tertiary">Beauty studio</p>
          <h1 className="font-display text-[clamp(4.4rem,20vw,9.5rem)] leading-[0.86] tracking-normal text-primary md:text-[clamp(5rem,10vw,10rem)]">
            MOON
            <br />
            STUDIO
          </h1>
          <p className="mx-auto mt-6 max-w-sm text-base leading-relaxed text-on-surface-variant md:mx-0 md:text-lg">
            Un espacio de belleza serena, detalle fino y rituales pensados para
            bajar el ritmo desde que entras.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
            <a className="button-primary" href="#reservar">
              Reservar turno
            </a>
            <a className="button-secondary" href="#servicios">
              Ver servicios
            </a>
          </div>
        </div>

        <figure className="order-1 mx-auto w-full max-w-[360px] overflow-hidden rounded-t-full rounded-b-lg border border-outline-variant/45 bg-surface-container-low p-2 shadow-halo md:order-2 md:max-w-[520px]">
          <img
            alt="Recepcion de Moon Studio con mural lunar"
            className="aspect-[3/4] h-full w-full rounded-t-full rounded-b-md object-cover"
            src={heroImage}
          />
        </figure>
      </div>

      <a
        className="absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3 whitespace-nowrap text-label uppercase text-tertiary"
        href="#servicios"
      >
        Desliza
        <span className="scroll-arrow" aria-hidden="true" />
      </a>
    </section>
  );
}
