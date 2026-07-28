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

    // Ignore a response that arrives after the endpoint changed or we unmounted.
    let active = true;

    api
      .get(endpoint)
      .then((res) => {
        if (active) setResult({ key, data: res.data, error: null });
      })
      .catch((err) => {
        if (active) setResult({ key, data: null, error: err.message });
      });

    return () => {
      active = false;
    };
  }, [key, endpoint]);

  const refetch = useCallback(() => setReloadToken((token) => token + 1), []);

  return { data: result.data, isLoading, error: result.error, refetch };
};

export default useFetch;
