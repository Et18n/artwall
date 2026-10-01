import dotenv from "dotenv";
import express from "express";
import { imageSize } from "image-size";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config();

const rootDirectory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const photoDirectory = path.resolve(
  rootDirectory,
  process.env.PHOTO_DIR || "photos",
);
const supportedExtensions = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".avif",
]);

export type PhotoManifestItem = {
  id: string;
  name: string;
  url: string;
  width: number;
  height: number;
  aspectRatio: number;
};

async function getManifest(): Promise<PhotoManifestItem[]> {
  const entries = await fs.readdir(photoDirectory, { withFileTypes: true });
  const photos = await Promise.all(
    entries
      .filter(
        (entry) =>
          entry.isFile() &&
          supportedExtensions.has(path.extname(entry.name).toLowerCase()),
      )
      .sort((left, right) => left.name.localeCompare(right.name))
      .map(async (entry) => {
        const name = entry.name;
        const buffer = await fs.readFile(path.join(photoDirectory, name));
        const dimensions = imageSize(buffer);
        const width = dimensions.width ?? 1;
        const height = dimensions.height ?? 1;
        return {
          id: name,
          name,
          url: `/photos/${encodeURIComponent(name)}`,
          width,
          height,
          aspectRatio: width / height,
        };
      }),
  );
  return photos;
}

const app = express();
app.get("/api/photos", async (_request, response) => {
  try {
    response.json({
      photos: await getManifest(),
      directory: path.relative(rootDirectory, photoDirectory) || ".",
    });
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") {
      response
        .status(200)
        .json({
          photos: [],
          directory: path.relative(rootDirectory, photoDirectory) || ".",
          message: "Photo directory not found yet.",
        });
      return;
    }
    response
      .status(500)
      .json({
        photos: [],
        directory: path.relative(rootDirectory, photoDirectory) || ".",
        message: "The photo directory could not be read.",
      });
  }
});

app.get("/photos/:name", async (request, response) => {
  const requestedName = request.params.name;
  const safeName = path.basename(requestedName);
  if (
    safeName !== requestedName ||
    !supportedExtensions.has(path.extname(safeName).toLowerCase())
  ) {
    response.status(400).end();
    return;
  }
  const filePath = path.join(photoDirectory, safeName);
  try {
    response.sendFile(filePath);
  } catch {
    response.status(404).end();
  }
});

const port = Number(process.env.API_PORT || 3001);
app.listen(port, () =>
  console.log(`Photo API listening on http://localhost:${port}`),
);
