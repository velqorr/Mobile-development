import { useCallback, useEffect, useRef, useState } from 'react';
import { getProducts, API_ENDPOINTS } from '../services/apiService';

const PAGE_SIZE = 10;

export default function useFetch(endpoint) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);

  const controllers = useRef(new Set());
  const mounted = useRef(false);
  const requestId = useRef(0);
  const loadingMoreRef = useRef(false);

  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
      controllers.current.forEach((controller) => controller.abort());
      controllers.current.clear();
    };
  }, []);

  const createController = () => {
    const controller = new AbortController();
    controllers.current.add(controller);
    return controller;
  };

  const refetch = useCallback(async () => {
    if (endpoint !== API_ENDPOINTS.products) {
      setError('Неизвестный адрес API');
      setLoading(false);
      return;
    }

    const currentRequest = ++requestId.current;

    controllers.current.forEach((controller) => controller.abort());
    controllers.current.clear();
    loadingMoreRef.current = false;

    const controller = createController();

    setRefreshing(true);
    setLoading(true);
    setLoadingMore(false);
    setError(null);

    try {
      const result = await getProducts(
        PAGE_SIZE,
        0,
        'title',
        'asc',
        controller.signal
      );

      if (!mounted.current || currentRequest !== requestId.current) return;

      setData(result.products);
      setTotal(result.total);
    } catch (err) {
      if (err.name !== 'AbortError' && mounted.current && currentRequest === requestId.current) {
        setData([]);
        setTotal(0);
        setError(
          err.message === 'NETWORK_ERROR'
            ? 'Нет подключения к интернету. Проверьте сеть.'
            : 'Не удалось получить данные. Попробуйте ещё раз.'
        );
      }
    } finally {
      controllers.current.delete(controller);

      if (mounted.current && currentRequest === requestId.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [endpoint]);

  const loadMore = useCallback(async () => {
    if (
      loadingMoreRef.current ||
      loading ||
      refreshing ||
      data.length === 0 ||
      data.length >= total
    ) {
      return;
    }

    loadingMoreRef.current = true;

    const controller = createController();
    setLoadingMore(true);

    try {
      const result = await getProducts(
        PAGE_SIZE,
        data.length,
        'title',
        'asc',
        controller.signal
      );

      if (!mounted.current) return;

      setData((previous) => {
        const existingIds = new Set(previous.map((item) => item.id));
        const newProducts = result.products.filter(
          (item) => !existingIds.has(item.id)
        );

        return [...previous, ...newProducts];
      });

      setTotal(result.total);
    } catch (err) {
      if (err.name !== 'AbortError' && mounted.current) {
        setError(
          err.message === 'NETWORK_ERROR'
            ? 'Нет подключения к интернету. Проверьте сеть.'
            : 'Не удалось загрузить дополнительные данные.'
        );
      }
    } finally {
      controllers.current.delete(controller);
      loadingMoreRef.current = false;

      if (mounted.current) {
        setLoadingMore(false);
      }
    }
  }, [data, loading, refreshing, total]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    data,
    loading,
    error,
    refreshing,
    loadingMore,
    refetch,
    loadMore,
    hasMore: data.length < total,
  };
}
