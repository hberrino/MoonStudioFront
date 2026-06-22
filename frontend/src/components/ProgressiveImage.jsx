import { useState } from "react";

export default function ProgressiveImage({
  className = "",
  eager = false,
  instant = false,
  onLoad,
  ...props
}) {
  const [isLoaded, setIsLoaded] = useState(instant);

  return (
    <span
      className={`progressive-image${isLoaded ? " is-loaded" : ""}${
        instant ? " is-instant" : ""
      }`}
    >
      {!instant ? <span aria-hidden="true" className="progressive-image-placeholder" /> : null}
      <img
        {...props}
        className={className}
        decoding="async"
        fetchPriority={eager ? "high" : "auto"}
        loading={eager ? "eager" : "lazy"}
        onLoad={(event) => {
          setIsLoaded(true);
          onLoad?.(event);
        }}
      />
    </span>
  );
}
