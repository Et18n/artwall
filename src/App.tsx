import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { Lightbox } from "./components/Lightbox";
import { PhotoWall } from "./components/PhotoWall";
import {
  clearSavedOrder,
  persistOrder,
  reconcileOrder,
} from "./lib/photoStore";
import type { Photo } from "./types";

type ManifestResponse = {
  photos: Photo[];
  directory: string;
  message?: string;
};

function App() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [query, setQuery] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [directory, setDirectory] = useState("photos");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/photos")
      .then(async (response) => {
        if (!response.ok) throw new Error("Unable to load the photo manifest.");
        return response.json() as Promise<ManifestResponse>;
      })
      .then((manifest) => {
        setPhotos(reconcileOrder(manifest.photos));
        setDirectory(manifest.directory);
        setMessage(manifest.message ?? "");
        setStatus("ready");
      })
      .catch(() => {
        setMessage("Start the local photo server to connect your wall.");
        setStatus("error");
      });
  }, []);

  const filteredPhotos = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return normalizedQuery
      ? photos.filter((photo) =>
          photo.name.toLowerCase().includes(normalizedQuery),
        )
      : photos;
  }, [photos, query]);

  const movePhoto = (fromId: string, toId: string) => {
    setPhotos((current) => {
      const fromIndex = current.findIndex((photo) => photo.id === fromId);
      const toIndex = current.findIndex((photo) => photo.id === toId);
      if (fromIndex < 0 || toIndex < 0) return current;
      const next = [...current];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      persistOrder(next);
      return next;
    });
  };

  const resetOrder = () => {
    clearSavedOrder();
    setPhotos((current) =>
      [...current].sort((left, right) => left.name.localeCompare(right.name)),
    );
  };

  const selectedIndex = selectedPhoto
    ? filteredPhotos.findIndex((photo) => photo.id === selectedPhoto.id)
    : -1;
  const changeSelectedPhoto = (direction: -1 | 1) => {
    if (selectedIndex < 0 || filteredPhotos.length === 0) return;
    const nextIndex =
      (selectedIndex + direction + filteredPhotos.length) %
      filteredPhotos.length;
    setSelectedPhoto(filteredPhotos[nextIndex]);
  };

  return (
    <div className="app-shell">
      <header className="masthead">
        <div className="brand-lockup">
          <span className="eyebrow">A private index of images</span>
          <h1>
            Artwall<span className="brand-mark">•</span>
          </h1>
        </div>
        <div className="header-note">
          <span className="pulse" />
          Local archive / {directory}
        </div>
      </header>
      <section className="intro" aria-labelledby="wall-title">
        <div>
          <p className="kicker">The collection</p>
          <h2 id="wall-title">
            Small moments,
            <br />
            <em>carefully kept.</em>
          </h2>
        </div>
        <p className="intro-copy">
          A living wall for the images that deserve a little more room to
          breathe.
        </p>
      </section>
      <div className="toolbar">
        <label className="search-field">
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            placeholder="Find an image..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Find an image"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </label>
        <div className="toolbar-actions">
          <span className="photo-count">
            {filteredPhotos.length}{" "}
            {filteredPhotos.length === 1 ? "image" : "images"}
          </span>
          <button
            className="reset-button"
            type="button"
            onClick={resetOrder}
            disabled={photos.length === 0}
          >
            Reset order
          </button>
        </div>
      </div>
      {status === "loading" && (
        <div className="state-panel">
          <span className="loader" />
          <p>Gathering the collection...</p>
        </div>
      )}
      {status === "error" && (
        <div className="state-panel state-error">
          <p>{message}</p>
          <small>Check that the local API is running on port 3001.</small>
        </div>
      )}
      {status === "ready" && photos.length === 0 && (
        <div className="state-panel">
          <p>{message || "Your wall is waiting for its first image."}</p>
          <small>
            Add photos to the configured <strong>{directory}</strong> folder and
            refresh.
          </small>
        </div>
      )}
      {status === "ready" &&
        photos.length > 0 &&
        filteredPhotos.length === 0 && (
          <div className="state-panel">
            <p>No images match “{query}”.</p>
          </div>
        )}
      {status === "ready" && filteredPhotos.length > 0 && (
        <PhotoWall
          photos={filteredPhotos}
          onOpen={setSelectedPhoto}
          onMove={movePhoto}
        />
      )}
      <footer className="footer-note">
        <span>© {new Date().getFullYear()} / private by default</span>
        <span>Drag to compose your own view</span>
      </footer>
      {selectedPhoto && (
        <Lightbox
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          onPrevious={() => changeSelectedPhoto(-1)}
          onNext={() => changeSelectedPhoto(1)}
        />
      )}
    </div>
  );
}

export default App;
