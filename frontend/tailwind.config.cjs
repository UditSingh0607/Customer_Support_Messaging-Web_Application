/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'branch-navy': '#0F172A',
                'branch-slate': '#1E293B',
                'branch-blue': '#2563EB',
                'branch-light': '#F8FAFC',
                'branch-gray': '#64748B',
                'branch-success': '#059669',
                'branch-error': '#DC2626',
            },
        },
    },
    plugins: [],
}
