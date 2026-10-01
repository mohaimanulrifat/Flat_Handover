import { useEffect, useState } from "react";
import { getPhoto } from "../lib/photos.ts";

interface Props {
  photoId: string;
  onRemove?: () => void;
}

/** A small photo preview. Tap to see it full screen. */
export function PhotoThumb({ photoId, onRemove }: Props) {
  const [url, setUrl] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;
    getPhoto(photoId)
      .then((blob) => {
        if (cancelled) return;
        if (!blob) return setMissing(true);
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch(() => !cancelled && setMissing(true));
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [photoId]);

  return (
    <div className="thumb">
      <button
        type="button"
        className="thumb__open"
        onClick={() => url && setOpen(true)}
        aria-label="Show photo full screen"
      >
        {url ? (
          <img src={url} alt="" />
        ) : (
          <span className="small muted">{missing ? "Photo missing" : "…"}</span>
        )}
      </button>
      {onRemove && (
        <button
          type="button"
          className="thumb__remove"
          aria-label="Delete photo"
          onClick={() => {
            if (confirm("Delete this photo?")) onRemove();
          }}
        >
          ×
        </button>
      )}
      {open && url && (
        <button
          type="button"
          className="lightbox"
          onClick={() => setOpen(false)}
          aria-label="Close photo"
        >
          <img src={url} alt="" />
        </button>
      )}
    </div>
  );
}
