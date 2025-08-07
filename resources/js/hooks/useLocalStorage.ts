import { useState, useEffect } from 'react';

// Define the return type for the hook
type UseLocalStorageReturn<T> = [T, (value: T) => void, () => void];

/**
 * Custom hook to manage state in local storage.
 * @param key The key to use in local storage.
 * @param initialValue The initial value if nothing is in local storage.
 * @returns A stateful value, a function to update it, and a function to remove it.
 */
export function useLocalStorage<T>(key: string, initialValue: T): UseLocalStorageReturn<T> {
    // Get stored value from local storage or use initial value
    const getStoredValue = (): T => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(`Error reading from local storage for key "${key}":`, error);
            return initialValue;
        }
    };

    // State to store our value
    const [storedValue, setStoredValue] = useState<T>(getStoredValue);

    // Update local storage whenever the state changes
    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(storedValue));
        } catch (error) {
            console.error(`Error writing to local storage for key "${key}":`, error);
        }
    }, [key, storedValue]);

    // Function to set a new value
    const setValue = (value: T) => {
        setStoredValue(value);
    };

    // Function to remove the value from local storage
    const removeValue = () => {
        try {
            window.localStorage.removeItem(key);
            setStoredValue(initialValue); // Reset state to initial value
        } catch (error) {
            console.error(`Error removing from local storage for key "${key}":`, error);
        }
    };

    return [storedValue, setValue, removeValue];
}
