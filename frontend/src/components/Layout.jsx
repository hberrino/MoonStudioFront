import { useEffect } from "react";
import Footer from "./Footer.jsx";
import Header from "./Header.jsx";

export default function Layout({ children }) {
  useEffect(() => {
    const elements = document.querySelectorAll("[data-reveal]");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      elements.forEach((element) => element.classList.add("is-revealed"));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        });
      },
      {
        rootMargin: "0px 0px -10% 0px",
        threshold: 0.12,
      },
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="site-background min-h-screen text-on-background">
      <div className="grain-overlay" />
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
