"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/src/utils/api";

const EMPTY_RESULT = {
  key: null,
  endpoint: null,
  items: [],
  data: null,
  error: null,
};

const mergeById = (previous, incoming) => {
  const seen = new Set(previous.map((item) => item._id));
  return [...previous, ...incoming.filter((item) => !seen.has(item._id))];
};

const usePaginatedFetch = (endpoint, { page = 1, itemsKey }) => {
  const [reloadToken, setReloadToken] = useState(0);
  const [result, setResult] = useState(EMPTY_RESULT);

  const key = endpoint ? `${endpoint}#${reloadToken}` : null;
  const isLoading = key !== null && result.key !== key;
  const isNewQuery = result.endpoint !== endpoint;

  useEffect(() => {
    if (!key) return undefined;

    const controller = new AbortController();
    let active = true;

    api
      .get(endpoint, { signal: controller.signal })
      .then((res) => {
        if (!active) return;

        const incoming = res.data?.[itemsKey] || [];

        setResult((previous) => ({
          key,
          endpoint,
          data: res.data,
          error: null,
          items: page === 1 ? incoming : mergeById(previous.items, incoming),
        }));
      })
      .catch((err) => {
        if (!active || err?.name === "AbortError") return;
        setResult({ key, endpoint, items: [], data: null, error: err.message });
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [key, endpoint, page, itemsKey]);

  const refetch = useCallback(() => setReloadToken((token) => token + 1), []);

  const removeItem = useCallback((id) => {
    setResult((previous) => ({
      ...previous,
      items: previous.items.filter((item) => item._id !== id),
    }));
  }, []);

  return {
    items: isLoading && page === 1 && isNewQuery ? [] : result.items,
    data: result.data,
    isLoading,
    error: result.error,
    refetch,
    removeItem,
  };
};

export default usePaginatedFetch;
