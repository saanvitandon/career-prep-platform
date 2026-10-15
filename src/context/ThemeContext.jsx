import { createContext, useContext, useEffect } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  useEffect(() => {
    const root = document.documentElement;

    root.classList.add("dark");
    root.style.colorScheme = "dark";

    // Keep the existing preference key compatible with the app.
    localStorage.setItem("placement-theme", "dark");
  }, []);

  // Dark mode is permanent; there is no theme toggle.
  const value = {
    darkMode: true,
    toggleDarkMode: () => {},
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}