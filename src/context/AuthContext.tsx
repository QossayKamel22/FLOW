import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "../lib/firebase";
import { friendlyAuthError } from "../lib/errors";

interface AuthContextValue {
  user: User | null;
  initializing: boolean;
  firebaseReady: boolean;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  logIn: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    if (!auth) {
      setInitializing(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setInitializing(false);
    });
    return unsubscribe;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      initializing,
      firebaseReady: isFirebaseConfigured,
      async signUp(name, email, password) {
        if (!auth) throw new Error("Firebase is not configured.");
        try {
          const credential = await createUserWithEmailAndPassword(auth, email, password);
          if (name.trim()) {
            await updateProfile(credential.user, { displayName: name.trim() });
          }
        } catch (error) {
          throw new Error(friendlyAuthError(error));
        }
      },
      async logIn(email, password) {
        if (!auth) throw new Error("Firebase is not configured.");
        try {
          await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
          throw new Error(friendlyAuthError(error));
        }
      },
      async logOut() {
        if (!auth) return;
        await signOut(auth);
      },
    }),
    [user, initializing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
