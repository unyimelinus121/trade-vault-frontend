"use client";

import { useEffect, useRef } from "react";

export default function useVisibleInterval(callback, delay, enabled = true) {
  const callbackRef = useRef(callback);
  const runningRef = useRef(false);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled || !delay) return undefined;

    async function run() {
      if (document.visibilityState !== "visible" || runningRef.current) return;
      runningRef.current = true;
      try {
        await callbackRef.current();
      } finally {
        runningRef.current = false;
      }
    }

    const timer = window.setInterval(run, delay);
    const handleVisibility = () => {
      if (document.visibilityState === "visible") run();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [delay, enabled]);
}
