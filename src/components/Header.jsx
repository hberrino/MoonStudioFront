import { useState } from "react";

const navItems = [
  { label: "Inicio", href: "#inicio" },
  { label: "Servicios", href: "#servicios" },
  { label: "Nosotros", href: "#nosotros" },
  { label: "Reservar turno", href: "#reservar" },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-outline-variant/40 bg-background/82 shadow-lunar backdrop-blur-md">
      <div className="mx-auto flex max-w-container items-center justify-between px-5 py-4 md:px-16 md:py-6">
        <a
          className="font-display text-[1.7rem] leading-none tracking-normal text-primary md:text-3xl"
          href="#inicio"
          onClick={() => setIsOpen(false)}
        >
          MOON STUDIO
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.slice(0, 3).map((item) => (
            <a className="nav-link" href={item.href} key={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <a
          className="hidden rounded-full border border-primary bg-primary px-5 py-3 text-label uppercase text-white transition hover:border-[#4f4436] hover:bg-[#4f4436] hover:shadow-[0_10px_26px_rgba(80,69,52,0.18)] md:inline-flex"
          href="#reservar"
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
