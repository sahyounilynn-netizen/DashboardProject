import { useEffect, useState } from "react";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";

const USER_STORAGE_KEY = "dashboard-user";
const THEME_STORAGE_KEY = "dashboard-theme";

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = window.localStorage.getItem(USER_STORAGE_KEY);

    if (!savedUser) {
      return null;
    }

    try {
      return JSON.parse(savedUser);
    } catch {
      window.localStorage.removeItem(USER_STORAGE_KEY);
      return null;
    }
  });
  const [theme, setTheme] = useState(() => {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

    if (savedTheme === "dark" || savedTheme === "light") {
      return savedTheme;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  function handleAuthenticated(user) {
    setCurrentUser(user);
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  }

  function handleLogout() {
    setCurrentUser(null);
    window.localStorage.removeItem(USER_STORAGE_KEY);
  }

  function handleThemeToggle() {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  }

  if (!currentUser) {
    return (
      <AuthPage
        onAuthenticated={handleAuthenticated}
        onThemeToggle={handleThemeToggle}
        theme={theme}
      />
    );
  }

  return (
    <HomePage
      onLogout={handleLogout}
      onThemeToggle={handleThemeToggle}
      theme={theme}
      user={currentUser}
    />
  );
}

export default App;
