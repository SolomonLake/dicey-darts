import React, { useRef, useEffect, useState } from "react";
import { themeChange } from "theme-change";

const svg = {
    light: (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5 inline-block"
        >
            <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
        </svg>
    ),
    dark: (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-4 h-4 inline-block"
        >
            <path
                fillRule="evenodd"
                d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z"
                clipRule="evenodd"
            />
        </svg>
    ),
};

const themeMap = {
    light: "emerald",
    dark: "dim",
};

export const DarkModeSwitcher: React.FC = (): JSX.Element => {
    const switcher = useRef<HTMLDivElement | null>(null);
    const switcherButton = useRef<HTMLButtonElement>(null);

    const [activeTheme, setActiveTheme] = useState<"light" | "dark">("light");
    // const [showDropdown, setShowDropdown] = useState<boolean>(false);

    // const dropdownMenuClasses = twMerge(
    //     "min-w-max absolute bg-white text-base z-[1000] overflow-hidden float-left list-none text-left rounded-lg shadow-lg m-0 bg-clip-padding border-none dark:bg-neutral-800",
    //     showDropdown ? "block -translate-x-full -translate-y-full" : "hidden",
    // );

    const setDarkTheme = () => {
        localStorage.theme = "dark";

        setActiveTheme("dark");
        // setShowDropdown(false);
    };

    const setLightTheme = () => {
        localStorage.theme = "dim";

        setActiveTheme("light");
        // setShowDropdown(false);
    };

    const toggleTheme = () => {
        if (activeTheme === "light") {
            setDarkTheme();
        } else {
            setLightTheme();
        }
    };

    // const handleClickOutside = (event: MouseEvent) => {
    //     if (!switcher.current?.contains(event.target as Node)) {
    //         // setShowDropdown(false);
    //         return;
    //     }
    // };

    useEffect(() => {
        // On page load or when changing themes, best to add inline in `head` to avoid FOUC
        if (
            localStorage.theme === "dark" ||
            (!("theme" in localStorage) &&
                window.matchMedia("(prefers-color-scheme: dark)").matches)
        ) {
            setDarkTheme();
        } else {
            setLightTheme();
        }
    }, []);

    // useEffect(() => {
    //     window.addEventListener("click", handleClickOutside);
    //     return () => {
    //         window.removeEventListener("click", handleClickOutside);
    //     };
    // }, []);

    useEffect(() => {
        themeChange(false);
        // 👆 false parameter is required for react project
    }, []);

    return (
        <>
            <div
                className="fixed left-2 top-2 z-[9999]"
                id="theme-switcher"
                ref={switcher}
            >
                <div className="relative">
                    <button
                        ref={switcherButton}
                        className="btn btn-accent btn-circle"
                        type="button"
                        id="themeSwitcher"
                        aria-expanded="false"
                        onClick={() => toggleTheme()}
                        data-set-theme={themeMap[activeTheme]}
                    >
                        {svg[activeTheme as keyof typeof svg]}
                    </button>
                    {/* <ul
                        className={dropdownMenuClasses}
                        aria-labelledby="themeSwitcher"
                    >
                        <li>
                            <a
                                className={twMerge(
                                    "btn",
                                    activeTheme === "light"
                                        ? "btn-primary"
                                        : "btn-neutral",
                                )}
                                data-set-theme="emerald"
                                data-act-class="btn-primary"
                                onClick={setLightTheme}
                            >
                                <div className="pointer-events-none">
                                    <div
                                        className="inline-block w-[24px] text-center"
                                        data-theme-icon="light"
                                    >
                                        {svg.light}
                                    </div>
                                    <span>Light</span>
                                </div>
                            </a>
                        </li>
                        <li>
                            <button
                                className={twMerge(
                                    "btn",
                                    activeTheme === "dark"
                                        ? "btn-primary"
                                        : "btn-neutral",
                                )}
                                data-set-theme="dim"
                                onClick={setDarkTheme}
                            >
                                <div className="pointer-events-none">
                                    <div
                                        className="inline-block w-[24px] text-center"
                                        data-theme-icon="dark"
                                    >
                                        {svg.dark}
                                    </div>
                                    <span>Dark</span>
                                </div>
                            </button>
                        </li>
                    </ul> */}
                </div>
            </div>
        </>
    );
};
