// Client-side helper: shrink a photo before upload (phone photos are often huge).
async function shrink(file: File, maxSide = 1600, quality = 0.85): Promise<Blob> {
  if (!file.type.startsWith("image/") || (file.type === "image/gif" && maxSide >= 1600)) return file;
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b ?? file), "image/jpeg", quality));
}

export async function uploadImage(file: File): Promise<string> {
  const blob = await shrink(file);
  const body = new FormData();
  body.append("file", new File([blob], "image.jpg", { type: blob.type || file.type }));
  // Light version for lists and grids (~40-80 KB instead of several hundred).
  const thumb = await shrink(file, 720, 0.8);
  if (thumb.type === "image/jpeg") body.append("thumb", new File([thumb], "thumb.jpg", { type: "image/jpeg" }));
  const res = await fetch("/api/upload", { method: "POST", body });
  const data = await res.json().catch(() => ({ error: "Erreur d'envoi" }));
  if (!res.ok) throw new Error(data.error ?? "Erreur d'envoi");
  return data.url as string;
}
