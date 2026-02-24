/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                "primary": "#e84b2c",
                "secondary": "#886963",
                "background-light": "#f9f7f5",
                "background-dark": "#211411",
                "surface-light": "#ffffff",
                "surface-dark": "#2d1b17",
                "border-light": "#e5dddc",
                "border-dark": "#4a2e26",
            },
            fontFamily: {
                "sans": ["Work Sans", "sans-serif"],
                "serif": ["DM Serif Display", "serif"],
            },
            borderRadius: {
                "DEFAULT": "0px",
                "lg": "0px",
                "xl": "0px",
                "full": "9999px",
            },
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/container-queries'),
    ],
}
