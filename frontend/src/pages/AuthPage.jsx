import { useState } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { loginUser, registerUser } from "../services/api";

function OrbitalDecor() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute right-[-6%] top-[12%] h-72 w-72 rounded-full bg-[#93c5fd]/45 blur-3xl sm:h-96 sm:w-96" />
      <div className="absolute bottom-[-10%] left-[18%] h-64 w-64 rounded-full bg-[#60a5fa]/30 blur-3xl sm:h-80 sm:w-80" />
      <div className="absolute left-[-6%] bottom-[8%] h-64 w-64 rounded-full bg-[#dbeafe]/28 blur-3xl sm:h-80 sm:w-80" />

      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.16)_1px,transparent_1px)] bg-[size:72px_72px] opacity-30" />
    </div>
  );
}

function AuthPage({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function switchMode(nextMode) {
    setMode(nextMode);
    setError("");
  }

  function getFriendlyAuthError(message, currentMode) {
    if (message === "Failed to fetch") {
      return "We couldn't connect right now. Please check the server and try again.";
    }

    if (currentMode === "login" && message === "Invalid email or password.") {
      return "Incorrect email or password. Please try again.";
    }

    return message;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const user =
        mode === "register"
          ? await registerUser({ name, email, password })
          : await loginUser({ email, password });

      onAuthenticated(user, mode);
    } catch (err) {
      setError(getFriendlyAuthError(err.message, mode));
    } finally {
      setIsSubmitting(false);
    }
  }

  const isRegisterMode = mode === "register";

  return (
    <main className="relative h-screen overflow-hidden bg-[#cfe3fb] px-4 py-4 text-[var(--text-primary)] sm:px-6 lg:px-8">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#eff6ff_0%,#c5dcf8_28%,#7fb0ea_62%,#274f87_100%)]" />
      </div>
      <OrbitalDecor />

      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col">
        <div className="flex flex-1 items-center justify-center">
          <div className="flex w-full max-w-5xl flex-col items-center justify-center gap-6 lg:gap-8">
            <div className="hidden md:block text-center">
              <div className="relative mx-auto max-w-2xl">
                <div className="absolute left-1/2 top-1/2 h-24 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1e3a8a]/18 blur-3xl" />
                <p className="relative bg-[linear-gradient(90deg,#0f172a_0%,#1e3a8a_28%,#1d4ed8_58%,#172554_100%)] bg-clip-text text-2xl font-semibold italic tracking-[0.08em] text-transparent drop-shadow-[0_8px_24px_rgba(15,23,42,0.18)] lg:text-3xl">
                  A calm place to organize tasks, deadlines, and momentum.
                </p>
              </div>
            </div>

            <div className="w-full max-w-xl">
              <div className="rounded-[34px] border border-white/28 bg-[rgba(248,251,255,0.88)] p-4 shadow-[0_24px_80px_rgba(15,23,42,0.22)] backdrop-blur-2xl sm:p-6">
                <Card className="overflow-hidden border-0 bg-transparent shadow-none">
                  <CardHeader className="space-y-4 px-0 pb-4 pt-0 text-center">
                    <div className="mx-auto inline-flex w-fit rounded-full bg-[rgba(219,234,254,0.95)] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.24em] text-[#1d4ed8]">
                      Account Access
                    </div>
                    <div className="space-y-2">
                      <CardTitle className="text-3xl sm:text-[2.3rem]">
                        {isRegisterMode ? "Create your account" : "Welcome back"}
                      </CardTitle>
                      <CardDescription className="text-sm leading-6 sm:text-base">
                        {isRegisterMode
                          ? "Create your profile and get started."
                          : "Sign in to continue."}
                      </CardDescription>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-5 px-0 pb-0 pt-2">
                    <div className="grid grid-cols-2 gap-2 rounded-[24px] bg-[rgba(226,236,250,0.72)] p-2">
                      <button
                        className={`rounded-[18px] px-4 py-3 text-sm font-semibold transition ${
                          !isRegisterMode
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-500 hover:bg-white/60"
                        }`}
                        onClick={() => switchMode("login")}
                        type="button"
                      >
                        Log in
                      </button>
                      <button
                        className={`rounded-[18px] px-4 py-3 text-sm font-semibold transition ${
                          isRegisterMode
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-500 hover:bg-white/60"
                        }`}
                        onClick={() => switchMode("register")}
                        type="button"
                      >
                        Sign up
                      </button>
                    </div>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                      {error ? (
                        <div className="rounded-2xl border border-red-200 bg-[var(--bg-danger-soft)] px-4 py-3 text-sm text-red-700">
                          {error}
                        </div>
                      ) : null}

                      {isRegisterMode ? (
                        <div className="space-y-2">
                          <Label htmlFor="name">Name</Label>
                          <Input
                            id="name"
                            onChange={(event) => setName(event.target.value)}
                            placeholder="Lynn Carter"
                            type="text"
                            value={name}
                          />
                        </div>
                      ) : null}

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          onChange={(event) => setEmail(event.target.value)}
                          placeholder="you@example.com"
                          type="email"
                          value={email}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          onChange={(event) => setPassword(event.target.value)}
                          placeholder={
                            isRegisterMode
                              ? "Create a secure password"
                              : "Enter your password"
                          }
                          type="password"
                          value={password}
                        />
                      </div>

                      <Button
                        className="w-full"
                        disabled={isSubmitting}
                        size="lg"
                        type="submit"
                      >
                        {isSubmitting
                          ? "Please wait..."
                          : isRegisterMode
                            ? "Create account"
                            : "Log in"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default AuthPage;
