/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#2563EB',
        },
        success: {
          500: '#16A34A',
        },
        warning: {
          500: '#EAB308',
        },
        danger: {
          500: '#DC2626',
        },
        neutral: {
          100: '#F3F4F6',
        },
      },
      fontFamily: {
        sans: ['system-ui', 'Inter', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        'card': '6px',
        'popup': '12px',
      },
      boxShadow: {
        'card': '1px 1px 3px rgba(0,0,0,0.1)',
        'elevated': '2px 4px 6px rgba(0,0,0,0.1)',
      },
    },
  },
  plugins: [],
}
