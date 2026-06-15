import { useState } from "react";

export default function ProgressiveImage({ className = "", eager = false, onLoad, ...props }) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <span className={`progressive-image${isLoaded ? " is-loaded" : ""}`}>
      <span aria-hidden="true" className="progressive-image-placeholder" />
      <img
        {...props}
        className={className}
        decoding="async"
        loading={eager ? "eager" : "lazy"}
        onLoad={(event) => {
          setIsLoaded(true);
          onLoad?.(event);
        }}
      />
    </span>
  );
}
