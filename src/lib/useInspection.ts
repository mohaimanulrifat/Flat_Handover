import { useEffect, useReducer, useState, type Dispatch } from "react";
import {
  inspectionReducer,
  loadInspection,
  referencedPhotos,
  saveInspection,
  type Action,
  type Inspection,
} from "./inspection.ts";
import { deleteUnusedPhotos } from "./photos.ts";

/**
 * The inspection, saved to the phone on every change. `saveFailed` is true
 * if the browser refused to save (for example, private browsing or full
 * storage), so the screen can warn the buyer.
 */
export function useInspection(): [Inspection, Dispatch<Action>, boolean] {
  const [state, dispatch] = useReducer(inspectionReducer, undefined, () =>
    loadInspection(),
  );
  const [saveFailed, setSaveFailed] = useState(false);

  useEffect(() => {
    setSaveFailed(!saveInspection(state));
  }, [state]);

  // Clear out photos left behind by removed rooms or a reset. Runs when
  // the app opens and whenever the layout changes (a reset clears it).
  useEffect(() => {
    deleteUnusedPhotos(referencedPhotos(state)).catch(() => {});
  }, [state.layout]);

  return [state, dispatch, saveFailed];
}
