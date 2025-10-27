import { useAppConfig } from '@/contexts/AppConfigContext';
import { useState, useEffect, useCallback, useRef } from 'react';
type SlashStart = `/${string}`;

export function useFetch<T>(url: SlashStart, options?: RequestInit) {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const controllerRef = useRef<AbortController | null>(null);
    const { apiBaseUrl } = useAppConfig();

    const fetchData = useCallback(async () => {
        const controller = new AbortController();
        controllerRef.current = controller;
        setLoading(true);
        try {
            const response = await fetch(`${apiBaseUrl}${url}`, {
                signal: controller.signal,
                ...options,
            });
            if (!response.ok) throw new Error(`${response.status}`);
            const json = await response.json();
            setData(json);
            setError(null);
        } catch (err: any) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [url]);
    const abort = useCallback(() => {
        controllerRef.current?.abort();
    }, []);
    useEffect(() => {
        fetchData();
        return () => {
            controllerRef.current?.abort();
        };
    }, [fetchData]);

    return { data, loading, error, refetch: fetchData, abort };
}
