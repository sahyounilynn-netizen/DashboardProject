import { useEffect, useState } from "react";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";

const USER_STORAGE_KEY = "dashboard-user";
const THEME_STORAGE_KEY = "dashboard-theme";

function normalizeUser(user) {
  if (!user || typeof user !== "object") {
    return null;
  }

  const rawId = user.id ?? user.userId;
  const id = Number(rawId);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return {
    ...user,
    id,
  };
}

function App() {
  const [authEntrySource, setAuthEntrySource] = useState(null);
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = window.localStorage.getItem(USER_STORAGE_KEY);

    if (!savedUser) {
      return null;
    }

    try {
      const parsedUser = JSON.parse(savedUser);
      const normalizedUser = normalizeUser(parsedUser);

      if (!normalizedUser) {
        window.localStorage.removeItem(USER_STORAGE_KEY);
        return null;
      }

      return normalizedUser;
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

  function handleAuthenticated(user, entrySource = "login") {
    const normalizedUser = normalizeUser(user);

    if (!normalizedUser) {
      window.localStorage.removeItem(USER_STORAGE_KEY);
      setCurrentUser(null);
      setAuthEntrySource(null);
      return;
    }

    setCurrentUser(normalizedUser);
    setAuthEntrySource(entrySource);
    window.localStorage.setItem(
      USER_STORAGE_KEY,
      JSON.stringify(normalizedUser)
    );
  }

  function handleLogout() {
    setCurrentUser(null);
    setAuthEntrySource(null);
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
      authEntrySource={authEntrySource}
      onLogout={handleLogout}
      onThemeToggle={handleThemeToggle}
      theme={theme}
      user={currentUser}
    />
  );
}

export default App;
