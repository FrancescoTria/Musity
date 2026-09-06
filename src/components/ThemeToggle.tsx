import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[--ring]"
      style={{
        backgroundColor: theme === "dark" ? "var(--primary)" : "var(--border)",
      }}
    >
      <span
        className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 flex items-center justify-center text-[10px]"
        style={{ transform: theme === "dark" ? "translateX(24px)" : "translateX(0)" }}
      >
        {theme === "dark" ? "🌙" : "☀️"}
      </span>
    </button>
  );
}
