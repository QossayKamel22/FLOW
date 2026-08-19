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

  function subscribe(uid: string, onChange: (items: T[]) => void, onError: (e: unknown) => void): Unsubscribe {
    const q = query(ref(uid), orderBy("createdAt", "desc"));
    return onSnapshot(
      q,
      (snap) => onChange(snap.docs.map((d) => fromDoc(d.id, d.data()))),
      onError
    );
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
