import { useContext } from "react";
import { THEME_CONTEXT, ThemeContext } from "@/context/themeContext";

export function useThemeContext() {
  const data = useContext(ThemeContext) as THEME_CONTEXT;
  return data;
}