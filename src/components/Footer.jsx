export default function Footer() {
  return (
    <footer className="border-t border-outline-variant bg-surface-container-low">
      <div className="mx-auto flex max-w-container flex-col items-center gap-8 px-5 py-16 text-center md:flex-row md:justify-between md:px-16 md:py-24 md:text-left">
        <a className="font-display text-3xl text-primary" href="#inicio">
          MOON STUDIO
        </a>
        <nav className="flex flex-wrap justify-center gap-x-7 gap-y-4 text-label uppercase text-on-secondary-fixed-variant">
          <a className="transition hover:text-primary" href="/">
            Instagram
          </a>
          <a className="transition hover:text-primary" href="/">
            WhatsApp
          </a>
          <a className="transition hover:text-primary" href="/">
            Direccion
          </a>
          <a className="transition hover:text-primary" href="/">
            Politicas
          </a>
        </nav>
        <p className="max-w-48 text-sm leading-relaxed text-secondary md:text-right">
          © 2026 MOON STUDIO. Serenity in precision.
        </p>
      </div>
    </footer>
  );
}
