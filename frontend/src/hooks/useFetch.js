"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/src/utils/api";

// Fetches `endpoint` and re-fetches whenever it changes.
// `isLoading` is derived rather than stored, so the effect never calls setState
// synchronously (see the react-hooks/set-state-in-effect rule).
const useFetch = (endpoint) => {
  const [reloadToken, setReloadToken] = useState(0);
  const [result, setResult] = useState({ key: null, data: null, error: null });

  const key = endpoint ? `${endpoint}#${reloadToken}` : null;
  const isLoading = key !== null && result.key !== key;

  useEffect(() => {
    if (!key) return undefined;

    const controller = new AbortController();
    let active = true;

    api
      .get(endpoint, { signal: controller.signal })
      .then((res) => {
        if (active) setResult({ key, data: res.data, error: null });
      })
      .catch((err) => {
        if (!active || err?.name === "AbortError") return;
        setResult({ key, data: null, error: err.message });
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [key, endpoint]);

  const refetch = useCallback(() => setReloadToken((token) => token + 1), []);

  return { data: result.data, isLoading, error: result.error, refetch };
};

export default useFetch;
