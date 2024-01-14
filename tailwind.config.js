/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        fontFamily: {
            sans: [
                "Outfit",
                '"M PLUS Rounded 1c"',
                '"Victor Mono"',
                "Roboto",
                "sans-serif",
            ],
        },
        extend: {
            backgroundImage: {
                diagonal:
                    "repeating-linear-gradient(45deg,var(--fallback-b1,oklch(var(--b1))),var(--fallback-b1,oklch(var(--b1))) 10px,var(--fallback-b2,oklch(var(--b2))) 10px,var(--fallback-b2,oklch(var(--b2))) 16px)",
            },
        },
    },
    plugins: [require("@tailwindcss/typography"), require("daisyui")],
    daisyui: {
        themes: ["emerald", "dim"],
    },
};
