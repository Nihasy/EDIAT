// Vehicle photos are stored in two sizes: the full image (max 1600 px) and a
// light thumbnail (max 720 px) next to it, named "<same name>-t.jpg".
// Cards and lists use the thumbnail; the vehicle page uses the full image.

const OWN = /(vehicles-\d+-[a-f0-9]+)\.(jpg|png|webp|gif)$/;

export function isOwnUpload(url: string) {
  return OWN.test(url);
}

export function thumbUrl(url: string | null | undefined): string {
  if (!url) return "";
  return OWN.test(url) ? url.replace(OWN, "$1-t.jpg") : url;
}

// Photos are our own uploads, or https links (e.g. a supplier's auction page).
export function isAllowedImageUrl(url: string) {
  return /^\/api\/files\/vehicles-[\w-]+\.(jpg|png|webp|gif)$/.test(url) || /^https:\/\/[^\s"'<>]+$/.test(url);
}

export const MAX_IMAGES = 30;
