import { describe, expect, it } from "vitest";
import {
  answersLostByLayout,
  emptyInspection,
  inspectionReducer,
  loadInspection,
  referencedPhotos,
  sanitise,
  saveInspection,
  type Inspection,
} from "./inspection.ts";

function started(): Inspection {
  return inspectionReducer(emptyInspection(), {
    type: "setLayout",
    layout: { bedrooms: 2, bathrooms: 1, balconies: 1 },
  });
}

describe("inspectionReducer", () => {
  it("All OK marks only unanswered items", () => {
    let state = started();
    state = inspectionReducer(state, {
      type: "setStatus",
      key: "living/A1",
      status: "problem",
    });
    state = inspectionReducer(state, {
      type: "setStatus",
      key: "living/A2",
      status: "na",
    });
    state = inspectionReducer(state, {
      type: "markUnansweredOk",
      keys: ["living/A1", "living/A2", "living/A3"],
    });
    expect(state.answers["living/A1"].status).toBe("problem");
    expect(state.answers["living/A2"].status).toBe("na");
    expect(state.answers["living/A3"].status).toBe("ok");
  });

  it("keeps problem details when the status changes", () => {
    let state = started();
    state = inspectionReducer(state, {
      type: "setStatus",
      key: "kitchen/C4",
      status: "problem",
    });
    state = inspectionReducer(state, {
      type: "setNote",
      key: "kitchen/C4",
      note: "Smell",
    });
    state = inspectionReducer(state, {
      type: "addPhoto",
      key: "kitchen/C4",
      photoId: "p1",
    });
    state = inspectionReducer(state, {
      type: "setStatus",
      key: "kitchen/C4",
      status: "ok",
    });
    expect(state.answers["kitchen/C4"]).toEqual({
      status: "ok",
      note: "Smell",
      photos: ["p1"],
    });
  });

  it("drops answers for rooms removed from the layout", () => {
    let state = started();
    state = inspectionReducer(state, {
      type: "setStatus",
      key: "bedroom-2/A1",
      status: "ok",
    });
    state = inspectionReducer(state, {
      type: "setStatus",
      key: "bedroom-1/A1",
      status: "ok",
    });
    const smaller = { bedrooms: 1, bathrooms: 1, balconies: 1 };
    expect(answersLostByLayout(state, smaller)).toBe(1);
    state = inspectionReducer(state, { type: "setLayout", layout: smaller });
    expect(Object.keys(state.answers)).toEqual(["bedroom-1/A1"]);
  });

  it("lists the photos still in use", () => {
    let state = started();
    state = inspectionReducer(state, {
      type: "addPhoto",
      key: "living/A1",
      photoId: "a",
    });
    state = inspectionReducer(state, {
      type: "addPhoto",
      key: "living/A1",
      photoId: "b",
    });
    state = inspectionReducer(state, {
      type: "removePhoto",
      key: "living/A1",
      photoId: "a",
    });
    expect([...referencedPhotos(state)]).toEqual(["b"]);
  });
});

describe("saving", () => {
  function memoryStorage(): Storage {
    const data = new Map<string, string>();
    return {
      getItem: (k) => data.get(k) ?? null,
      setItem: (k, v) => void data.set(k, v),
      removeItem: (k) => void data.delete(k),
      clear: () => data.clear(),
      key: (i) => [...data.keys()][i] ?? null,
      get length() {
        return data.size;
      },
    };
  }

  it("round-trips an inspection", () => {
    const storage = memoryStorage();
    let state = started();
    state = inspectionReducer(state, {
      type: "setStatus",
      key: "living/A1",
      status: "ok",
    });
    expect(saveInspection(state, storage)).toBe(true);
    expect(loadInspection(storage)).toEqual(state);
  });

  it("starts fresh when saved data is unreadable", () => {
    const storage = memoryStorage();
    storage.setItem("handover-check:inspection:v1", "{not json");
    expect(loadInspection(storage).layout).toBeNull();
  });

  it("ignores invalid fields", () => {
    const state = sanitise({
      layout: { bedrooms: 2, bathrooms: 1, balconies: 1 },
      answers: {
        "living/A1": {
          status: "broken",
          severity: "huge",
          note: 5,
          photos: ["x", 3],
        },
        "living/A2": "nonsense",
      },
    });
    expect(state.answers).toEqual({ "living/A1": { photos: ["x"] } });
  });
});
