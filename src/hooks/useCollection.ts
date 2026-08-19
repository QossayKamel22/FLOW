import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { friendlyFirestoreError } from "../lib/errors";

interface Service<T> {
  subscribe(uid: string, onChange: (items: T[]) => void, onError: (e: unknown) => void): () => void;
}

export function useCollection<T>(service: Service<T>) {
  const { user } = useAuth();
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = service.subscribe(
      user.uid,
      (next) => {
        setItems(next);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(friendlyFirestoreError(err));
        setLoading(false);
      }
    );
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, service]);

  return { items, loading, error, uid: user?.uid ?? null };
}
