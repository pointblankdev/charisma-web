import { useState, useEffect } from 'react';

export function usePersistedState<T>(key: string, defaultValue: T): [T, (value: T) => void] {
    const [state, setState] = useState<T>(defaultValue);

    useEffect(() => {
        const storedValue = localStorage.getItem(key);
        if (storedValue !== null) {
            setState(JSON.parse(storedValue));
        }
    }, [key]);

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(state));
    }, [key, state]);

    return [state, setState];
}