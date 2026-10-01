/**
 * Shrinks a photo to at most `maxEdge` pixels on its longest side and
 * re-encodes it as JPEG. Phone camera photos are several megabytes; this
 * keeps storage and the PDF small.
 */
export async function resizeImage(
  source: Blob,
  maxEdge: number,
  quality: number,
): Promise<Blob> {
  const url = URL.createObjectURL(source);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();

    // Browsers apply the photo's EXIF rotation when drawing an <img>.
    const scale = Math.min(
      1,
      maxEdge / Math.max(img.naturalWidth, img.naturalHeight),
    );
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is not available");
    // JPEG has no transparency, so start from white rather than black.
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (blob) =>
          blob ? resolve(blob) : reject(new Error("Could not encode photo")),
        "image/jpeg",
        quality,
      ),
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}
