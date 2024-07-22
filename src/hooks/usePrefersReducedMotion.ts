import React from "react";

const QUERY = "(prefers-reduced-motion: no-preference)";
export const getInitialReducedMotion = () => !window.matchMedia(QUERY).matches;

export const usePrefersReducedMotion = () => {
    const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(
        getInitialReducedMotion,
    );
    React.useEffect(() => {
        const mediaQueryList = window.matchMedia(QUERY);
        const listener = (event: MediaQueryListEvent) => {
            setPrefersReducedMotion(!event.matches);
        };
        mediaQueryList.addEventListener("change", listener);
        return () => {
            mediaQueryList.removeEventListener("change", listener);
        };
    }, []);
    return prefersReducedMotion;
};
