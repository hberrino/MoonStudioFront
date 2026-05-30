const attemptsByKey = new Map();

export function rateLimit({ limit, windowMs }) {
  return (req, res, next) => {
    const key = `${req.ip}:${req.originalUrl}`;
    const now = Date.now();
    const current = attemptsByKey.get(key) || { count: 0, resetAt: now + windowMs };

    if (current.resetAt <= now) {
      current.count = 0;
      current.resetAt = now + windowMs;
    }

    current.count += 1;
    attemptsByKey.set(key, current);

    if (current.count > limit) {
      return res.status(429).json({
        message: "Demasiados intentos. Espera unos minutos y proba nuevamente.",
      });
    }

    return next();
  };
}
