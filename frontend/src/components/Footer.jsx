export default function Footer() {
  return (
    <footer className="border-t border-outline-variant bg-surface-container-low">
      <div className="mx-auto grid max-w-container items-center gap-7 px-5 py-12 text-center md:grid-cols-[1fr_auto_1fr] md:px-16 md:py-16">
        <a aria-label="Moon Studio inicio" className="footer-logo-link" href="/#inicio">
          <img
            alt="Moon Studio"
            className="footer-logo-img"
            decoding="async"
            loading="lazy"
            src="/images/logo/logoficial.png"
          />
        </a>
        <nav className="flex flex-wrap justify-center gap-x-7 gap-y-4 text-label uppercase text-on-secondary-fixed-variant">
          <a
            className="transition hover:text-primary"
            href="https://www.instagram.com/moonstudio.ok/"
            rel="noreferrer"
            target="_blank"
          >
            Instagram
          </a>
          <a
            className="transition hover:text-primary"
            href="https://maps.app.goo.gl/Q53sonYEGUteeBto8"
            rel="noreferrer"
            target="_blank"
          >
            Direccion
          </a>
          <a className="transition hover:text-primary" href="/politicas">
            Politicas
          </a>
        </nav>
        <div className="mx-auto max-w-64 text-center text-sm leading-relaxed text-secondary md:mx-0 md:justify-self-end">
          <p>© 2026 Moon Studio. Todos los derechos reservados.</p>
          <p className="mt-2 text-[0.68rem] text-on-surface-variant">
            Desarrollado por Hernan Berrino
          </p>
          <div className="footer-protection-badge" aria-label="Protegido por Cloudflare">
            <span>Protegido por</span>
            <img
              alt="Cloudflare"
              className="footer-cloudflare-logo"
              decoding="async"
              loading="lazy"
              src="/icons/Cloudflare-logo.png"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
