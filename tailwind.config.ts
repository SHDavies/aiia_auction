import withMT from "@material-tailwind/react/utils/withMT";
import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

export default withMT({
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./node_modules/@material-tailwind/react/components/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@material-tailwind/react/theme/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        indeterminateAnimation: {
          "0%": {
            transform: "translateX(0) scaleX(0)",
          },
          "40%": {
            transform: "translateX(0) scaleX(0.4)",
          },
          "100%": {
            transform: "translateX(100%) scaleX(0.5)",
          },
        },
      },
      animation: {
        "indeterminate-progress": "indeterminateAnimation 1s infinite linear",
      },
      backgroundImage: {
        hero: "url('/img/hero.jpeg')",
      },
      fontFamily: {
        sans: ["Roboto", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
} satisfies Config);
