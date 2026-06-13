export function rateLimit({ limit, windowMs }) {
  const attemptsByKey = new Map();
  let requestsSinceCleanup = 0;

  return (req, res, next) => {
    const key = `${req.ip}:${req.baseUrl}${req.path}`;
    const now = Date.now();
    const current = attemptsByKey.get(key) || { count: 0, resetAt: now + windowMs };

    if (current.resetAt <= now) {
      current.count = 0;
      current.resetAt = now + windowMs;
    }

    current.count += 1;
    attemptsByKey.set(key, current);
    requestsSinceCleanup += 1;

    if (requestsSinceCleanup >= 250 || attemptsByKey.size > 10_000) {
      for (const [storedKey, attempt] of attemptsByKey) {
        if (attempt.resetAt <= now) attemptsByKey.delete(storedKey);
      }
      requestsSinceCleanup = 0;
    }

    res.setHeader("X-RateLimit-Limit", String(limit));
    res.setHeader("X-RateLimit-Remaining", String(Math.max(0, limit - current.count)));

    if (current.count > limit) {
      res.setHeader("Retry-After", String(Math.ceil((current.resetAt - now) / 1000)));
      return res.status(429).json({
        message: "Demasiados intentos. Espera unos minutos y proba nuevamente.",
      });
    }

    return next();
  };
}
