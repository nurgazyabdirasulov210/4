import { useEffect, useState } from "react";
import { useCafe } from "@/store/cafe";

export function useCafeReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const finish = () => setReady(true);
    const unsub = useCafe.persist.onFinishHydration(finish);
    if (useCafe.persist.hasHydrated()) finish();
    else void useCafe.persist.rehydrate();
    return unsub;
  }, []);
  return ready;
}

export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

export function useNow(enabled: boolean) {
  const [now, setNow] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [enabled]);
  return now;
}
