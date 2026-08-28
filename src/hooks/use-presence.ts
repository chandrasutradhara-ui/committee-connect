import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { useEffect, useRef } from "react";

export function usePresence() {
  const touchPresence = useMutation(api.users.touchPresence);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Touch immediately on mount
    touchPresence();

    // Then every 20 seconds
    intervalRef.current = setInterval(() => {
      touchPresence();
    }, 20000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [touchPresence]);
}
