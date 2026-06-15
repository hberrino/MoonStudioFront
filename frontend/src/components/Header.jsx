import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const navItems = [
  { label: "Inicio", href: "/#inicio" },
  { label: "Servicios", href: "/#servicios" },
  { label: "Nosotros", href: "/#nosotros" },
  { label: "Estudio", href: "/#espacio" },
  { label: "Reservar turno", href: "/#reservar" },
];

export default function Header() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const updateHeaderVisibility = () => {
      setHasScrolled(window.scrollY > 48);
    };

    updateHeaderVisibility();
    window.addEventListener("scroll", updateHeaderVisibility, { passive: true });

    return () => window.removeEventListener("scroll", updateHeaderVisibility);
  }, []);

  const isVisible = location.pathname !== "/" || hasScrolled || isOpen;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b border-outline-variant/40 bg-background/82 shadow-lunar backdrop-blur-md transition duration-500 ${
        isVisible ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-full opacity-0"
      }`}
    >
      <div className="mx-auto grid max-w-container grid-cols-[auto_auto] items-center justify-between px-5 py-4 md:grid-cols-[1fr_auto_1fr] md:px-16 md:py-6">
        <a
          aria-label="Moon Studio inicio"
          className="site-logo-link"
          href="/#inicio"
          onClick={() => setIsOpen(false)}
        >
          <img
            alt="Moon Studio"
            className="site-logo-img"
            decoding="async"
            fetchPriority="high"
            src="/images/logo/logoficial.png"
          />
        </a>

        <nav className="hidden items-center gap-8 md:flex md:justify-self-center">
          {navItems.slice(0, 4).map((item) => (
            <a className="nav-link" href={item.href} key={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <a
          className="hidden rounded-full border border-[#5b4f3f] bg-[#5b4f3f] px-5 py-3 text-label uppercase text-white transition hover:border-[#4f4436] hover:bg-[#4f4436] hover:shadow-[0_10px_26px_rgba(80,69,52,0.18)] md:inline-flex md:justify-self-end"
          href="/#reservar"
        >
          Reservar turno
        </a>

        <button
          aria-expanded={isOpen}
          aria-label="Abrir menu"
          className="grid h-11 w-11 place-items-center rounded-full border border-outline-variant text-primary md:hidden"
          onClick={() => setIsOpen((value) => !value)}
          type="button"
        >
          <span className="relative h-4 w-5">
            <span className={`menu-line top-0 ${isOpen ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`menu-line top-2 ${isOpen ? "opacity-0" : ""}`} />
            <span className={`menu-line top-4 ${isOpen ? "-translate-y-2 -rotate-45" : ""}`} />
          </span>
        </button>
      </div>

      {isOpen ? (
        <nav className="border-t border-outline-variant/30 bg-background px-5 py-5 md:hidden">
          <div className="mx-auto flex max-w-container flex-col gap-4">
            {navItems.map((item) => (
              <a
                className="text-label uppercase text-on-surface-variant"
                href={item.href}
                key={item.href}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
