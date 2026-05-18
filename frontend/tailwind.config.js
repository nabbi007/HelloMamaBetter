/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("@relume_io/relume-tailwind")],
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./home/**/*.{js,jsx,ts,tsx}",
    "./about/**/*.{js,jsx,ts,tsx}",
    "./how-it-works/**/*.{js,jsx,ts,tsx}",
    "./products/**/*.{js,jsx,ts,tsx}",
    "./node_modules/@relume_io/relume-ui/dist/**/*.{js,ts,jsx,tsx}",
  ],
};
