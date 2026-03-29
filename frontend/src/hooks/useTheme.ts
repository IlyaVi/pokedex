import { useEffect } from "react";
import { useLocalStorage } from "react-use";

type Theme = "light" | "dark";

function getSystemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function useTheme() {
  const [theme, setTheme] = useLocalStorage<Theme>("theme", getSystemTheme());

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  function toggle() {
    setTheme(theme === "dark" ? "light" : "dark");
  }

  return { theme: theme ?? getSystemTheme(), toggle };
}
