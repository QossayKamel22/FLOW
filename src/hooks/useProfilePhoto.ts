import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { savePreferences } from "../services/userService";
import { useAuth } from "../context/AuthContext";

/** Resizes/crops an image file to a square JPEG data URL, capped at `size`px. */
export function fileToSquareDataUrl(file: File, size = 200): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Couldn't read that file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("That doesn't look like a valid image."));
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas isn't supported here."));
        const side = Math.min(img.width, img.height);
        const sx = (img.width - side) / 2;
        const sy = (img.height - side) / 2;
        ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function useProfilePhoto() {
  const { user } = useAuth();
  const [customPhoto, setCustomPhoto] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !db) {
      setCustomPhoto(null);
      return;
    }
    const ref = doc(db, "workspaces", user.uid, "preferences", "settings");
    const unsub = onSnapshot(ref, (snap) => {
      const data = snap.data();
      setCustomPhoto((data?.photoURL as string) || null);
    });
    return unsub;
  }, [user]);

  const photoURL = customPhoto || user?.photoURL || null;

  async function setPhoto(dataUrl: string) {
    if (!user) return;
    await savePreferences(user.uid, { photoURL: dataUrl });
  }

  async function removePhoto() {
    if (!user) return;
    await savePreferences(user.uid, { photoURL: "" });
  }

  return { photoURL, hasCustomPhoto: !!customPhoto, setPhoto, removePhoto };
}
