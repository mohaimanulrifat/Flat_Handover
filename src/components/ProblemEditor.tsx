import { useState, type ChangeEvent, type Dispatch } from "react";
import { SEVERITY_NAMES } from "../config.ts";
import { severityLevels } from "../data/checklist.ts";
import { resizeImage } from "../lib/image.ts";
import {
  NOTE_MAX_LENGTH,
  type Action,
  type Answer,
} from "../lib/inspection.ts";
import { deletePhoto, savePhoto } from "../lib/photos.ts";
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
  const [showExamples, setShowExamples] = useState(false);
  const [saving, setSaving] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function addPhotos(event: ChangeEvent<HTMLInputElement>) {
    const files = [...(event.target.files ?? [])];
    event.target.value = ""; // so the same photo can be chosen again
    setError(null);
    for (const file of files) {
      setSaving((n) => n + 1);
      try {
        const small = await resizeImage(file, PHOTO_MAX_EDGE, PHOTO_QUALITY);
        const photoId = await savePhoto(small);
        dispatch({ type: "addPhoto", key: itemKey, photoId });
      } catch {
        setError(
          "This photo could not be saved. Try again, or check that your phone has free space.",
        );
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
        <legend>How serious is it?</legend>
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
            <strong>{SEVERITY_NAMES[level.id]}</strong>
            {level.meaning}
          </button>
        ))}
        <button
          type="button"
          className="link small"
          onClick={() => setShowExamples(!showExamples)}
          aria-expanded={showExamples}
        >
          {showExamples ? "Hide examples" : "Show examples"}
        </button>
        {showExamples &&
          severityLevels.map((level) => (
            <p key={level.id} className="examples">
              <strong>{SEVERITY_NAMES[level.id]}:</strong> {level.examples}
            </p>
          ))}
      </fieldset>

      <label className="field" htmlFor={noteId}>
        <span className="field__label">Short note</span>
        <textarea
          id={noteId}
          value={answer.note ?? ""}
          maxLength={NOTE_MAX_LENGTH}
          placeholder="What is wrong, and exactly where?"
          onChange={(e) =>
            dispatch({ type: "setNote", key: itemKey, note: e.target.value })
          }
        />
      </label>

      <div className="field__label">Photos</div>
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
        <label className="btn btn--small file-btn">
          Take photo
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={addPhotos}
          />
        </label>
        <label className="btn btn--small file-btn">
          Choose from gallery
          <input type="file" accept="image/*" multiple onChange={addPhotos} />
        </label>
      </div>
      {saving > 0 && <p className="small muted">Saving photo…</p>}
      {error && (
        <p className="small" role="alert" style={{ color: "var(--problem)" }}>
          {error}
        </p>
      )}
    </div>
  );
}
