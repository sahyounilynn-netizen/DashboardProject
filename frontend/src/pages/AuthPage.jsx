import { useState } from "react";
import { MoonStar, ShieldCheck, Sparkles, SunMedium, Waves } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { loginUser, registerUser } from "../services/api";

function AuthPage({ onAuthenticated, onThemeToggle, theme }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      let user;

      if (mode === "register") {
        user = await registerUser({ name, email, password });
      } else {
        user = await loginUser({ email, password });
      }

      onAuthenticated(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setError("");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--bg-app)] px-5 py-6 text-[var(--text-primary)] sm:px-8 lg:px-10">
      <div className="relative z-10 mx-auto flex max-w-7xl justify-end pb-4">
        <Button onClick={onThemeToggle} size="sm" variant="secondary">
          {theme === "dark" ? (
            <SunMedium className="mr-2 h-4 w-4" />
          ) : (
            <MoonStar className="mr-2 h-4 w-4" />
          )}
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </Button>
      </div>

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8%] top-[-6%] h-72 w-72 rounded-full bg-blue-200/55 blur-3xl" />
        <div className="absolute right-[8%] top-[10%] h-64 w-64 rounded-full bg-sky-200/55 blur-3xl" />
        <div className="absolute bottom-[-10%] left-[28%] h-80 w-80 rounded-full bg-indigo-100 blur-3xl" />
      </div>

      <div className="relative mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <section className="flex min-h-[360px] flex-col justify-between rounded-[32px] border border-[var(--border-soft)] bg-[var(--bg-accent-hero)] p-8 text-white shadow-[var(--shadow-panel)] lg:p-10">
          <div className="space-y-4">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.28em] text-[var(--text-on-accent)]">
              <Waves className="h-4 w-4" />
              Dashboard Project
            </div>

            <div className="max-w-xl space-y-4">
              <h1 className="text-4xl font-semibold leading-tight text-balance sm:text-5xl">
                A calmer way to manage your work, one login at a time.
              </h1>
              <p className="max-w-lg text-base leading-7 text-white/78 sm:text-lg">
                Sign in to a focused workspace where your tasks, progress, and
                dashboard metrics stay connected to your own account.
              </p>
            </div>
          </div>

          <div className="grid gap-4 pt-8 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
              <ShieldCheck className="mb-4 h-6 w-6 text-sky-100" />
              <h3 className="text-sm font-semibold">Private task views</h3>
              <p className="mt-2 text-sm leading-6 text-white/74">
                Each user sees only their own tasks and updates.
              </p>
            </div>
            <div className="rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
              <Sparkles className="mb-4 h-6 w-6 text-sky-100" />
              <h3 className="text-sm font-semibold">Gentle visual rhythm</h3>
              <p className="mt-2 text-sm leading-6 text-white/74">
                Soft contrast, rounded panels, and calmer blue layers.
              </p>
            </div>
            <div className="rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
              <Waves className="mb-4 h-6 w-6 text-sky-100" />
              <h3 className="text-sm font-semibold">Ready to extend</h3>
              <p className="mt-2 text-sm leading-6 text-white/74">
                Built on reusable UI primitives for the next screens.
              </p>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center">
          <Card className="w-full max-w-xl">
            <CardHeader className="pb-2">
              <div className="mb-3 inline-flex w-fit rounded-full bg-[var(--bg-accent-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-accent)]">
                Account access
              </div>
              <CardTitle>
                {mode === "register" ? "Create your account" : "Welcome back"}
              </CardTitle>
              <CardDescription>
                Use a clean, secure sign-in flow to enter your personal dashboard.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Tabs
                className="space-y-4"
                onValueChange={switchMode}
                value={mode}
              >
                <TabsList>
                  <TabsTrigger value="login">Log In</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>

                <TabsContent value={mode}>
                  <form className="space-y-5" onSubmit={handleSubmit}>
                    {error && (
                      <div className="rounded-2xl border border-red-200 bg-[var(--bg-danger-soft)] px-4 py-3 text-sm text-red-700 dark:text-red-200">
                        {error}
                      </div>
                    )}

                    {mode === "register" && (
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          onChange={(event) => setName(event.target.value)}
                          placeholder="Your name"
                          type="text"
                          value={name}
                        />
                      </div>
                    )}

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
                        placeholder="Enter your password"
                        type="password"
                        value={password}
                      />
                    </div>

                    <div className="space-y-3 pt-2">
                      <Button
                        className="w-full"
                        disabled={isSubmitting}
                        size="lg"
                        type="submit"
                      >
                        {isSubmitting
                          ? "Please wait..."
                          : mode === "register"
                            ? "Create account"
                            : "Log in"}
                      </Button>

                      <p className="text-center text-sm leading-6 text-[var(--text-muted)]">
                        {mode === "register"
                          ? "Create your profile and start tracking tasks with your own data."
                          : "Sign in to continue where you left off in your dashboard."}
                      </p>
                    </div>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}

export default AuthPage;
