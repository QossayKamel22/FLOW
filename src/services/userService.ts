import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

export type ThemePreference = "light" | "dark";

export interface UserPreferences {
  theme: ThemePreference;
  displayName: string;
  businessName: string;
  industry: string;
  emailNotifications: boolean;
  dailyBriefing: boolean;
  photoURL?: string;
}

const defaultPreferences: UserPreferences = {
  theme: "dark",
  displayName: "",
  businessName: "",
  industry: "",
  emailNotifications: true,
  dailyBriefing: true,
};

function prefsDoc(uid: string) {
  if (!db) throw new Error("Firestore is not configured.");
  return doc(db, "workspaces", uid, "preferences", "settings");
}

export async function getPreferences(uid: string): Promise<UserPreferences> {
  const snap = await getDoc(prefsDoc(uid));
  if (!snap.exists()) return defaultPreferences;
  return { ...defaultPreferences, ...snap.data() } as UserPreferences;
}

export async function savePreferences(uid: string, prefs: Partial<UserPreferences>) {
  await setDoc(prefsDoc(uid), prefs, { merge: true });
}
