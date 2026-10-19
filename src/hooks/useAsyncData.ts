import { useCallback, useEffect, useState } from 'react';

export type AsyncDataState<T> = {
  data: T | null;
  error: string | null;
  loading: boolean;
  refresh: () => Promise<void>;
};

export function useAsyncData<T>(load: () => Promise<T>): AsyncDataState<T> {
  const [state, setState] = useState<{
    request: () => Promise<T>;
    data: T | null;
    error: string | null;
    loading: boolean;
  }>(() => ({ request: load, data: null, error: null, loading: true }));

  const refresh = useCallback(async () => {
    setState((previous) => ({
      request: load,
      data: previous.request === load ? previous.data : null,
      error: null,
      loading: true,
    }));
    try {
      const data = await load();
      setState({ request: load, data, error: null, loading: false });
    } catch (cause) {
      setState({
        request: load,
        data: null,
        error: cause instanceof Error ? cause.message : 'Unable to load data.',
        loading: false,
      });
    }
  }, [load]);

  useEffect(() => {
    let active = true;
    load()
      .then((data) => {
        if (active) setState({ request: load, data, error: null, loading: false });
      })
      .catch((cause: unknown) => {
        if (active) {
          setState({
            request: load,
            data: null,
            error: cause instanceof Error ? cause.message : 'Unable to load data.',
            loading: false,
          });
        }
      });
    return () => {
      active = false;
    };
  }, [load]);

  const hasCurrentRequest = state.request === load;
  return {
    data: hasCurrentRequest ? state.data : null,
    error: hasCurrentRequest ? state.error : null,
    loading: hasCurrentRequest ? state.loading : true,
    refresh,
  };
}
