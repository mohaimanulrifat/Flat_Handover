/**
 * Photo store in IndexedDB. Photos are too large for localStorage, and
 * IndexedDB keeps them on the phone across refreshes and offline use.
 */

const DB_NAME = "handover-check";
const DB_VERSION = 1;
const STORE = "photos";

interface StoredPhoto {
  id: string;
  type: string;
  // Stored as bytes rather than a Blob, which older Safari versions handle badly.
  data: ArrayBuffer;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  dbPromise ??= new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  dbPromise.catch(() => {
    dbPromise = null;
  });
  return dbPromise;
}

async function run<T>(
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const request = action(tx.objectStore(STORE));
    tx.oncomplete = () => resolve(request.result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function savePhoto(blob: Blob): Promise<string> {
  const photo: StoredPhoto = {
    id: newId(),
    type: blob.type || "image/jpeg",
    data: await blob.arrayBuffer(),
  };
  await run("readwrite", (store) => store.put(photo));
  return photo.id;
}

export async function getPhoto(id: string): Promise<Blob | null> {
  const photo = (await run("readonly", (store) => store.get(id))) as
    | StoredPhoto
    | undefined;
  return photo ? new Blob([photo.data], { type: photo.type }) : null;
}

export async function deletePhoto(id: string): Promise<void> {
  await run("readwrite", (store) => store.delete(id));
}

export async function clearPhotos(): Promise<void> {
  await run("readwrite", (store) => store.clear());
}

/** Deletes stored photos that no answer refers to any more. */
export async function deleteUnusedPhotos(keep: Set<string>): Promise<void> {
  const ids = (await run("readonly", (store) =>
    store.getAllKeys(),
  )) as string[];
  await Promise.all(ids.filter((id) => !keep.has(id)).map(deletePhoto));
}

/** Asks the browser not to clear our storage when the phone runs low. */
export function requestPersistentStorage(): void {
  navigator.storage?.persist?.().catch(() => {});
}
