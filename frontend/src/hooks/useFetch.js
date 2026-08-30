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

const collectItems = (previousItems, data, page, itemsKey) => {
  if (!itemsKey) return EMPTY_RESULT.items;

  const incoming = data?.[itemsKey] || [];
  return page === 1 ? incoming : mergeById(previousItems, incoming);
};

// Fetches `endpoint` and re-fetches whenever it changes.
// `isLoading` is derived rather than stored, so the effect never calls setState
// synchronously (see the react-hooks/set-state-in-effect rule).
// Pass `itemsKey` to accumulate a "load more" list across pages.
const useFetch = (endpoint, { page = 1, itemsKey = null } = {}) => {
  const [reloadToken, setReloadToken] = useState(0);
  const [result, setResult] = useState(EMPTY_RESULT);

  const key = endpoint ? `${endpoint}#${reloadToken}` : null;
  const isLoading = key !== null && result.key !== key;
  const isNewQuery = result.endpoint !== endpoint;

  useEffect(() => {
    if (!key) return undefined;

    // Ignore a response that arrives after the endpoint changed or we unmounted.
    let active = true;

    api
      .get(endpoint)
      .then((res) => {
        if (!active) return;

        setResult((previous) => ({
          key,
          endpoint,
          data: res.data,
          error: null,
          items: collectItems(previous.items, res.data, page, itemsKey),
        }));
      })
      .catch((err) => {
        if (!active) return;

        setResult({ key, endpoint, items: [], data: null, error: err.message });
      });

    return () => {
      active = false;
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
    data: result.data,
    items: isLoading && page === 1 && isNewQuery ? [] : result.items,
    isLoading,
    error: result.error,
    refetch,
    removeItem,
  };
};

export default useFetch;
