import { useState, type ChangeEvent, type Dispatch } from "react";
import { SEVERITY_NAMES } from "../config.ts";
import { severityLevels } from "../data/checklist.ts";
import { t } from "../lib/i18n.ts";
import { resizeImage } from "../lib/image.ts";
import {
  NOTE_MAX_LENGTH,
  type Action,
  type Answer,
} from "../lib/inspection.ts";
import { useLang } from "../lib/lang.ts";
import { deletePhoto, savePhoto } from "../lib/photos.ts";
import { Icon } from "./Icon.tsx";
import { PhotoThumb } from "./PhotoThumb.tsx";
import { severityStyle } from "./SeverityBadge.tsx";

// Photos are shrunk before saving: big enough to show a defect clearly,
// small enough that dozens fit on the phone and in the PDF.
const PHOTO_MAX_EDGE = 1600;
const PHOTO_QUALITY = 0.8;

interface Props {
  itemKey: string;
  answer: Answer;
  dispatch: Dispatch<Action>;
}

export function ProblemEditor({ itemKey, answer, dispatch }: Props) {
  const [lang] = useLang();
  const [showExamples, setShowExamples] = useState(false);
  const [saving, setSaving] = useState(0);
  const [failed, setFailed] = useState(false);

  async function addPhotos(event: ChangeEvent<HTMLInputElement>) {
    const files = [...(event.target.files ?? [])];
    event.target.value = ""; // so the same photo can be chosen again
    setFailed(false);
    for (const file of files) {
      setSaving((n) => n + 1);
      try {
        const small = await resizeImage(file, PHOTO_MAX_EDGE, PHOTO_QUALITY);
        const photoId = await savePhoto(small);
        dispatch({ type: "addPhoto", key: itemKey, photoId });
      } catch {
        setFailed(true);
      } finally {
        setSaving((n) => n - 1);
      }
    }
  }

  function removePhoto(photoId: string) {
    dispatch({ type: "removePhoto", key: itemKey, photoId });
    deletePhoto(photoId).catch(() => {});
  }

  const noteId = `note-${itemKey}`;

  return (
    <div className="problem">
      <fieldset>
        <legend>{t(lang, "howSerious")}</legend>
        {severityLevels.map((level) => (
          <button
            key={level.id}
            type="button"
            className="severity"
            style={severityStyle(level.id)}
            aria-pressed={answer.severity === level.id}
            onClick={() =>
              dispatch({
                type: "setSeverity",
                key: itemKey,
                severity: answer.severity === level.id ? undefined : level.id,
              })
            }
          >
            <span className="severity__dot" aria-hidden="true" />
            <span>
              <strong>{SEVERITY_NAMES[level.id][lang]}</strong>
              {level.meaning[lang]}
            </span>
          </button>
        ))}
        <button
          type="button"
          className="link small"
          onClick={() => setShowExamples(!showExamples)}
          aria-expanded={showExamples}
        >
          {t(lang, showExamples ? "hideExamples" : "showExamples")}
        </button>
        {showExamples &&
          severityLevels.map((level) => (
            <p key={level.id} className="examples">
              <strong>{SEVERITY_NAMES[level.id][lang]}:</strong>{" "}
              {level.examples[lang]}
            </p>
          ))}
      </fieldset>

      <label className="field" htmlFor={noteId}>
        <span className="field__label">{t(lang, "shortNote")}</span>
        <textarea
          id={noteId}
          value={answer.note ?? ""}
          maxLength={NOTE_MAX_LENGTH}
          placeholder={t(lang, "notePlaceholder")}
          onChange={(e) =>
            dispatch({ type: "setNote", key: itemKey, note: e.target.value })
          }
        />
      </label>

      <div className="field__label">{t(lang, "photos")}</div>
      {(answer.photos?.length ?? 0) > 0 && (
        <div className="photos">
          {answer.photos!.map((id) => (
            <PhotoThumb
              key={id}
              photoId={id}
              onRemove={() => removePhoto(id)}
            />
          ))}
        </div>
      )}
      <div className="btn-row">
        <label className="btn btn--small btn--primary file-btn">
          <Icon name="camera" size={18} />
          {t(lang, "takePhoto")}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={addPhotos}
          />
        </label>
        <label className="btn btn--small file-btn">
          <Icon name="image" size={18} />
          {t(lang, "chooseFromGallery")}
          <input type="file" accept="image/*" multiple onChange={addPhotos} />
        </label>
      </div>
      {saving > 0 && <p className="small muted">{t(lang, "savingPhoto")}</p>}
      {failed && (
        <p className="small error-text" role="alert">
          {t(lang, "photoSaveFailed")}
        </p>
      )}
    </div>
  );
}
