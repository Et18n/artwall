import { useEffect } from "react";
import type { Photo } from "../types";

type LightboxProps = {
  photo: Photo;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
};

export function Lightbox({
  photo,
  onClose,
  onPrevious,
  onNext,
}: LightboxProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") onPrevious();
      if (event.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.classList.add("lightbox-open");
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.classList.remove("lightbox-open");
    };
  }, [onClose, onNext, onPrevious]);

  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={photo.name}
      onClick={onClose}
    >
      <button
        className="icon-button lightbox-close"
        onClick={onClose}
        aria-label="Close viewer"
      >
        ×
      </button>
      <button
        className="icon-button lightbox-prev"
        onClick={(event) => {
          event.stopPropagation();
          onPrevious();
        }}
        aria-label="Previous photo"
      >
        ←
      </button>
      <figure onClick={(event) => event.stopPropagation()}>
        <img src={photo.url} alt={photo.name} />
        <figcaption>
          <strong>{photo.name}</strong>
          <span>
            {photo.width} × {photo.height}
          </span>
        </figcaption>
      </figure>
      <button
        className="icon-button lightbox-next"
        onClick={(event) => {
          event.stopPropagation();
          onNext();
        }}
        aria-label="Next photo"
      >
        →
      </button>
    </div>
  );
}
