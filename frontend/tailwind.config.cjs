/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'branch-purple': '#6C5CE7',
                'branch-blue': '#0984E3',
                'branch-green': '#00B894',
                'branch-red': '#D63031',
                'branch-orange': '#E17055',
                'branch-yellow': '#FDCB6E',
            },
        },
    },
    plugins: [],
}
