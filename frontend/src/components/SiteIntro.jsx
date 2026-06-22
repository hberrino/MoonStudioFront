import { useEffect, useState } from "react";

const INTRO_KEY = "moonstudio:intro-shown";
const MIN_VISIBLE_MS = 520;
const MAX_VISIBLE_MS = 1600;
const CRITICAL_IMAGES = [
  "/images/logo/moon-studio-hero.jpg",
];

function preloadImage(src) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = resolve;
    image.onerror = resolve;
    image.src = src;
  });
}

export default function SiteIntro() {
  const [isVisible, setIsVisible] = useState(() => {
    try {
      return sessionStorage.getItem(INTRO_KEY) !== "true";
    } catch {
      return true;
    }
  });
  const [isLeaving, setIsLeaving] = useState(false);
  const [isFontReady, setIsFontReady] = useState(false);

  useEffect(() => {
    if (!isVisible) return undefined;

    const startedAt = Date.now();
    let leaveTimer;
    let removeTimer;
    let hasFinished = false;

    const finish = () => {
      if (hasFinished) return;
      hasFinished = true;
      const remaining = Math.max(0, MIN_VISIBLE_MS - (Date.now() - startedAt));
      leaveTimer = window.setTimeout(() => {
        setIsLeaving(true);
        try {
          sessionStorage.setItem(INTRO_KEY, "true");
        } catch {
          // The intro still works when storage is unavailable.
        }
        removeTimer = window.setTimeout(() => setIsVisible(false), 360);
      }, remaining);
    };

    const fontPromise = document.fonts
      ? Promise.all([
          document.fonts.load('400 72px "Bodoni Moda"'),
          document.fonts.load('500 12px "DM Sans"'),
        ]).then(() => setIsFontReady(true))
      : Promise.resolve().then(() => setIsFontReady(true));

    const maximumTimer = window.setTimeout(finish, MAX_VISIBLE_MS);
    Promise.all([...CRITICAL_IMAGES.map(preloadImage), fontPromise]).then(() => {
      window.clearTimeout(maximumTimer);
      finish();
    });

    return () => {
      window.clearTimeout(maximumTimer);
      window.clearTimeout(leaveTimer);
      window.clearTimeout(removeTimer);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      aria-hidden="true"
      className={`site-intro${isFontReady ? " is-font-ready" : ""}${isLeaving ? " is-leaving" : ""}`}
    >
      <div className="site-intro-brand">
        <span>Moon</span>
        <strong>Studio</strong>
      </div>
      <span className="site-intro-line" />
    </div>
  );
}
