import { createContext, useEffect, useState } from "react";

export type THEME = "default" | "bubblegum";

export type THEME_CONTEXT = {
  theme: THEME,
  updateTheme: (theme: THEME) => void
}

const AVAILABLE_THEMES: THEME[] = ["default", "bubblegum"];

export const ThemeContext = createContext<THEME_CONTEXT | null>(null);

export function ThemesProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<THEME>("default");

  function updateTheme(theme: THEME) {
    setTheme(theme);
    localStorage.setItem("theme", theme);
    document.querySelector("html")?.setAttribute("data-theme", theme);
  }

  useEffect(() => {
    const currentTheme = localStorage.getItem("theme") as THEME | null;

    if(currentTheme && AVAILABLE_THEMES.includes(currentTheme)) {
      setTheme(currentTheme);
      document.querySelector("html")?.setAttribute("data-theme", currentTheme);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{
      theme,
      updateTheme
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

