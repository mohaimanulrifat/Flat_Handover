import { useEffect, useState } from "react";
import { t } from "../lib/i18n.ts";
import { useLang } from "../lib/lang.ts";
import { getPhoto } from "../lib/photos.ts";
import { Icon } from "./Icon.tsx";

interface Props {
  photoId: string;
  onRemove?: () => void;
}

/** A small photo preview. Tap to see it full screen. */
export function PhotoThumb({ photoId, onRemove }: Props) {
  const [lang] = useLang();
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
        aria-label={t(lang, "showPhoto")}
      >
        {url ? (
          <img src={url} alt="" />
        ) : (
          <span className="small">
            {missing ? t(lang, "photoMissing") : "…"}
          </span>
        )}
      </button>
      {onRemove && (
        <button
          type="button"
          className="thumb__remove"
          aria-label={t(lang, "deletePhoto")}
          onClick={() => {
            if (confirm(t(lang, "confirmDeletePhoto"))) onRemove();
          }}
        >
          <Icon name="x" size={16} />
        </button>
      )}
      {open && url && (
        <button
          type="button"
          className="lightbox"
          onClick={() => setOpen(false)}
          aria-label={t(lang, "closePhoto")}
        >
          <img src={url} alt="" />
        </button>
      )}
    </div>
  );
}
