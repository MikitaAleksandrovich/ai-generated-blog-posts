import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";

const ThemeToggleButton = ({ className = "" }) => {
  const { theme, systemTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const resolvedTheme = mounted && theme === "system" ? systemTheme : theme;
  const isDark = resolvedTheme === "dark";

  const handleToggle = () => {
    if (!mounted) return;
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      type="button"
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      aria-pressed={isDark}
      onClick={handleToggle}
      className={`inline-flex items-center justify-center rounded-full border border-slate-200 bg-card-light p-2 text-text-light shadow-card transition-colors duration-200 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-card-dark dark:text-text-dark dark:hover:bg-slate-700 dark:hover:text-white ${className}`}
    >
      <FontAwesomeIcon icon={isDark ? faSun : faMoon} className="h-4 w-4" />
      <span className="sr-only">
        {`Toggle to ${isDark ? "light" : "dark"} mode`}
      </span>
    </button>
  );
};

export default ThemeToggleButton;