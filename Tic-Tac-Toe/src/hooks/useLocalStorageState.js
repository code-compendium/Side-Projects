import { useEffect, useState } from "react";

export function useLocalStorageState(key, fallbackValue) {
	const [value, setValue] = useState(() => {
		try {
			const storedValue = window.localStorage.getItem(key);
			return storedValue ? JSON.parse(storedValue) : fallbackValue;
		} catch {
			return fallbackValue;
		}
	});

	useEffect(() => {
		window.localStorage.setItem(key, JSON.stringify(value));
	}, [key, value]);

	return [value, setValue];
}
