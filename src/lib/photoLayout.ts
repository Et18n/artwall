export function getTileClass(aspectRatio: number, index: number): string {
  if (aspectRatio >= 1.45)
    return index % 5 === 0 ? "tile-wide tile-tall" : "tile-wide";
  if (aspectRatio <= 0.78)
    return index % 4 === 1 ? "tile-tall tile-narrow" : "tile-tall";
  return index % 6 === 3 ? "tile-feature" : "tile-standard";
}
