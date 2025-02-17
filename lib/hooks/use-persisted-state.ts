import { useState, useEffect, useCallback } from 'react';

export function usePersistedState<T>(key: string, initialValue: T) {
    const [state, setState] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            return initialValue;
        }
    });

    const setValue = useCallback((value: T | ((prevState: T) => T)) => {
        setState(prevState => {
            const nextValue = value instanceof Function ? value(prevState) : value;
            window.localStorage.setItem(key, JSON.stringify(nextValue));
            return nextValue;
        });
    }, [key]);

    return [state, setValue] as const;
} 