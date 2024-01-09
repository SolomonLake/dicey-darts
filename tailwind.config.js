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
        extend: {},
    },
    plugins: [require("@tailwindcss/typography"), require("daisyui")],
    daisyui: {
        themes: ["emerald", "dim"],
    },
};
