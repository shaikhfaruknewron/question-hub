"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { api } from "@/src/utils/api";


const useFetch = (endpoint, { skip = false } = {}) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(!skip);
  const [error, setError] = useState(null);
  // Guards against a slow earlier request overwriting a newer response.
  const requestIdRef = useRef(0);

  const fetchData = useCallback(async () => {
    if (skip || !endpoint) {
      setIsLoading(false);
      return;
    }

    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setError(null);

    try {
      const res = await api.get(endpoint);
      if (requestId === requestIdRef.current) setData(res.data);
    } catch (err) {
      if (requestId === requestIdRef.current) {
        setError(err.message);
        setData(null);
      }
    } finally {
      if (requestId === requestIdRef.current) setIsLoading(false);
    }
  }, [endpoint, skip]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
};

export default useFetch;
