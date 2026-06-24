/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // レオパレス21ブランドカラー（#003087 - 濃紺）
        brand: {
          DEFAULT: "#003087",
          dark: "#001f5c",
          light: "#e6ebf3",
          accent: "#e60012",
          orange: "#f39800",
        },
        // 「AI機能」「人間判断」「セキュリティ」の3軸を視覚的に区別
        ai: {
          DEFAULT: "#7c3aed", // violet-600
          light: "#f5f3ff", // violet-50
          dark: "#5b21b6", // violet-800
        },
        human: {
          DEFAULT: "#d97706", // amber-600
          light: "#fffbeb", // amber-50
          dark: "#92400e", // amber-800
        },
        secure: {
          DEFAULT: "#059669", // emerald-600
          light: "#ecfdf5", // emerald-50
          dark: "#065f46", // emerald-800
        },
      },
      fontFamily: {
        sans: ['"Noto Sans JP"', '"Hiragino Sans"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};
