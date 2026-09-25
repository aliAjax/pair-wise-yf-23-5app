import { PLAYBACK } from "../constants/playback";

export const STORE_NAMES = {
  fixture: "fixture",
  cueScene: "cueScene",
  timelineTrack: "timelineTrack",
  showProject: "showProject",
  kv: "kv",
  snapshot: "snapshot"
} as const;

let dbPromise: Promise<IDBDatabase> | null = null;

/** 打开（必要时创建/升级）stage-light 库。数据、播放头、结果、快照均存于此。 */
export function openStageLightDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("INDEXEDDB_UNAVAILABLE"));
      return;
    }
    const request = indexedDB.open(PLAYBACK.DB_NAME, PLAYBACK.DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAMES.fixture)) db.createObjectStore(STORE_NAMES.fixture, { keyPath: "id" });
      if (!db.objectStoreNames.contains(STORE_NAMES.cueScene)) db.createObjectStore(STORE_NAMES.cueScene, { keyPath: "id" });
      if (!db.objectStoreNames.contains(STORE_NAMES.timelineTrack)) db.createObjectStore(STORE_NAMES.timelineTrack, { keyPath: "id" });
      if (!db.objectStoreNames.contains(STORE_NAMES.showProject)) db.createObjectStore(STORE_NAMES.showProject, { keyPath: "id" });
      if (!db.objectStoreNames.contains(STORE_NAMES.kv)) db.createObjectStore(STORE_NAMES.kv);
      if (!db.objectStoreNames.contains(STORE_NAMES.snapshot)) db.createObjectStore(STORE_NAMES.snapshot, { keyPath: "id", autoIncrement: true });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return dbPromise;
}

function tx<T>(storeName: string, mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openStageLightDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const transaction = db.transaction(storeName, mode);
        const request = run(transaction.objectStore(storeName));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      })
  );
}

export const idbGet = <T>(storeName: string, key: IDBValidKey): Promise<T | undefined> =>
  tx(storeName, "readonly", (store) => store.get(key) as IDBRequest<T>);

export const idbGetAll = <T>(storeName: string): Promise<T[]> =>
  tx(storeName, "readonly", (store) => store.getAll() as IDBRequest<T[]>);

export const idbPut = <T>(storeName: string, value: T): Promise<IDBValidKey> =>
  tx(storeName, "readwrite", (store) => store.put(value));

export const idbPutMany = async <T>(storeName: string, values: T[]): Promise<void> => {
  const db = await openStageLightDb();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    for (const value of values) store.put(value);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
};

export const idbDelete = (storeName: string, key: IDBValidKey): Promise<void> =>
  tx(storeName, "readwrite", (store) => store.delete(key)).then(() => undefined);

export const idbClear = async (storeName: string): Promise<void> => {
  await tx(storeName, "readwrite", (store) => store.clear());
};

/** 判断库内某实体表是否已写入过（用于首次进入时灌入种子数据）。 */
export async function isStoreSeeded(storeName: string): Promise<boolean> {
  const db = await openStageLightDb();
  return new Promise<boolean>((resolve, reject) => {
    const transaction = db.transaction(storeName, "readonly");
    const request = transaction.objectStore(storeName).count();
    request.onsuccess = () => resolve(request.result > 0);
    request.onerror = () => reject(request.error);
  });
}
