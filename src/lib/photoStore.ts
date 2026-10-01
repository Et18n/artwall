import type { Photo } from "../types";

const storageKey = "artwall:photo-order:v1";

function readSavedOrder(): string[] {
  try {
    const saved = window.localStorage.getItem(storageKey);
    const parsed: unknown = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) &&
      parsed.every((value) => typeof value === "string")
      ? parsed
      : [];
  } catch {
    return [];
  }
}

export function reconcileOrder(photos: Photo[]): Photo[] {
  const byId = new Map(photos.map((photo) => [photo.id, photo]));
  const savedOrder = readSavedOrder();
  const ordered = savedOrder.flatMap((id) => {
    const photo = byId.get(id);
    return photo ? [photo] : [];
  });
  const known = new Set(savedOrder);
  return ordered.concat(photos.filter((photo) => !known.has(photo.id)));
}

export function persistOrder(photos: Photo[]): void {
  try {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify(photos.map((photo) => photo.id)),
    );
  } catch {
    // Local persistence is optional and must never block browsing.
  }
}

export function clearSavedOrder(): void {
  try {
    window.localStorage.removeItem(storageKey);
  } catch {
    // Ignore storage restrictions in private or hardened browser contexts.
  }
}
