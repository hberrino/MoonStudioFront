import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_URL = "https://moonstudio.com.ar";

const pages = {
  "/": {
    title: "Moon Studio | Belleza, uñas, pestañas y peluquería en Tandil",
    description:
      "Conocé Moon Studio, sus servicios de peluquería, uñas, cejas y pestañas, y reservá tu turno online.",
    robots: "index, follow",
  },
  "/politicas": {
    title: "Políticas del estudio | Moon Studio",
    description:
      "Consultá las políticas de reservas, puntualidad, cancelaciones y servicios de Moon Studio.",
    robots: "index, follow",
  },
  "/admin": {
    title: "Administración | Moon Studio",
    description: "Acceso privado a la administración de Moon Studio.",
    robots: "noindex, nofollow",
  },
};

function setMeta(selector, attribute, value) {
  const element = document.head.querySelector(selector);
  if (element) element.setAttribute(attribute, value);
}

export default function PageMetadata() {
  const { pathname } = useLocation();

  useEffect(() => {
    const page = pages[pathname] || pages["/"];
    const canonicalUrl = `${SITE_URL}${pathname === "/" ? "" : pathname}`;

    document.title = page.title;
    setMeta('meta[name="description"]', "content", page.description);
    setMeta('meta[name="robots"]', "content", page.robots);
    setMeta('meta[property="og:title"]', "content", page.title);
    setMeta('meta[property="og:description"]', "content", page.description);
    setMeta('meta[property="og:url"]', "content", canonicalUrl);
    setMeta('meta[name="twitter:title"]', "content", page.title);
    setMeta('meta[name="twitter:description"]', "content", page.description);

    const canonical = document.head.querySelector('link[rel="canonical"]');
    if (canonical) canonical.setAttribute("href", canonicalUrl);
  }, [pathname]);

  return null;
}
