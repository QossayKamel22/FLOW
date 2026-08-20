import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type DocumentData,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "../lib/firebase";

/**
 * Generic per-workspace Firestore collection helper.
 * Data lives at workspaces/{uid}/{collectionName}, scoped to the signed-in user's uid,
 * which doubles as the workspace id for this single-user-workspace model.
 */
export function makeCollectionService<T extends { id: string; createdAt: number | null }>(
  collectionName: string,
  fromDoc: (id: string, data: DocumentData) => T
) {
  function ref(uid: string) {
    if (!db) throw new Error("Firestore is not configured.");
    return collection(db, "workspaces", uid, collectionName);
  }

  // Shared-listener cache: every `subscribe(uid, ...)` call for the same uid reuses
  // one underlying onSnapshot stream instead of each caller opening its own — several
  // components (sidebar search, dashboard, the record's own page) commonly subscribe
  // to the same collection at once.
  const cache = new Map<
    string,
    {
      items: T[];
      error: unknown;
      hasSnapshot: boolean;
      listeners: Set<{ onChange: (items: T[]) => void; onError: (e: unknown) => void }>;
      unsubscribe: Unsubscribe;
    }
  >();

  function subscribe(uid: string, onChange: (items: T[]) => void, onError: (e: unknown) => void): Unsubscribe {
    let entry = cache.get(uid);
    if (!entry) {
      const listeners = new Set<{ onChange: (items: T[]) => void; onError: (e: unknown) => void }>();
      const q = query(ref(uid), orderBy("createdAt", "desc"));
      const unsubscribe = onSnapshot(
        q,
        (snap) => {
          const items = snap.docs.map((d) => fromDoc(d.id, d.data()));
          const current = cache.get(uid);
          if (!current) return;
          current.items = items;
          current.hasSnapshot = true;
          current.error = null;
          for (const l of current.listeners) l.onChange(items);
        },
        (err) => {
          const current = cache.get(uid);
          if (!current) return;
          current.error = err;
          for (const l of current.listeners) l.onError(err);
        }
      );
      entry = { items: [], error: null, hasSnapshot: false, listeners, unsubscribe };
      cache.set(uid, entry);
    }

    const listener = { onChange, onError };
    entry.listeners.add(listener);
    if (entry.hasSnapshot) onChange(entry.items);
    else if (entry.error) onError(entry.error);

    return () => {
      const current = cache.get(uid);
      if (!current) return;
      current.listeners.delete(listener);
      if (current.listeners.size === 0) {
        current.unsubscribe();
        cache.delete(uid);
      }
    };
  }

  async function create(uid: string, data: Omit<T, "id" | "createdAt">) {
    await addDoc(ref(uid), { ...data, createdAt: serverTimestamp() });
  }

  async function update(uid: string, id: string, data: Partial<Omit<T, "id" | "createdAt">>) {
    if (!db) throw new Error("Firestore is not configured.");
    await updateDoc(doc(db, "workspaces", uid, collectionName, id), data as DocumentData);
  }

  async function remove(uid: string, id: string) {
    if (!db) throw new Error("Firestore is not configured.");
    await deleteDoc(doc(db, "workspaces", uid, collectionName, id));
  }

  return { subscribe, create, update, remove };
}

export function millis(data: DocumentData): number | null {
  return data.createdAt?.toMillis?.() ?? null;
}
