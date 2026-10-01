import type { DragEvent } from "react";
import type { Photo } from "../types";

type PhotoWallProps = {
  photos: Photo[];
  onOpen: (photo: Photo) => void;
  onMove: (fromId: string, toId: string) => void;
};

export function PhotoWall({ photos, onOpen, onMove }: PhotoWallProps) {
  const handleDrop = (event: DragEvent<HTMLElement>, targetId: string) => {
    event.preventDefault();
    const fromId = event.dataTransfer.getData("text/plain");
    if (fromId && fromId !== targetId) onMove(fromId, targetId);
  };

  return (
    <main className="wall" aria-label="Photo wall">
      {photos.map((photo, index) => (
        <article
          className="photo-tile"
          key={photo.id}
          draggable
          onDragStart={(event) =>
            event.dataTransfer.setData("text/plain", photo.id)
          }
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => handleDrop(event, photo.id)}
        >
          <button
            type="button"
            className="photo-button"
            onClick={() => onOpen(photo)}
            aria-label={`Open ${photo.name}`}
          >
            <img
              src={photo.url}
              alt={photo.name}
              loading={index < 4 ? "eager" : "lazy"}
            />
            <span className="photo-meta">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{photo.name}</strong>
            </span>
          </button>
        </article>
      ))}
    </main>
  );
}
