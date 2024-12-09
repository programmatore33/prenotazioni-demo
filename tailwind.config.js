import defaultTheme from "tailwindcss/defaultTheme";
import forms from "@tailwindcss/forms";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php",
    "./storage/framework/views/*.php",
    "./resources/views/**/*.blade.php",
    "./resources/js/**/*.vue",
  ],

  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', ...defaultTheme.fontFamily.sans],
        poppins: ['Poppins', ...defaultTheme.fontFamily.sans],
        courier: ['Courier Prime', ...defaultTheme.fontFamily.mono],
      },
      maxWidth: {
        '8xl': '1920px',
      },
      colors: {
        primary: {
          50: "#F2F8FF",
          DEFAULT: "#004c9c",
          100: "#e6f0fb",
          200: "#bfd2e6",
          300: "#80a5cd",
          400: "#4079b5",
          500: "#004c9c",
          600: "#12437d",
          700: "#103765",
          800: "#122c4a",
          900: "#0a1828",
        },
        grey: {
          50: '#F9F9F9',
          100: '#f5f5f5',
          200: '#e0e0e0',
          300: '#b9b9bb',
          400: '#96969a',
          500: '#737378',
          600: '#66656b',
          700: '#525157',
          800: '#393939',
          900: '#1f1f1f'
        },
        alert: {
          100: '#ffe2e4',
          200: '#F79096',
          300: '#e6414b',
          400: '#bb2d36',
          500: '#6b060d'
        },
      },
    },
  },
  plugins: [forms],
};
