import { createContext, Dispatch, SetStateAction } from "react";

export type ThemeOptions = "emerald" | "dim";

export const INITIAL_THEME =
    localStorage.theme ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dim"
        : "emerald");

export const ThemeContext = createContext<{
    theme: ThemeOptions;
    setTheme: Dispatch<SetStateAction<ThemeOptions>>;
}>({
    theme: INITIAL_THEME,
    setTheme: () => {},
});
