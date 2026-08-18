import { createFileRoute, Link } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  return (
    <main className="grid min-h-dvh place-items-center bg-studio px-6 text-fg dark:bg-studio-ink dark:text-fg-on-ink">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-8 flex items-center gap-2">
          <svg viewBox="0 0 32 32" className="size-5" aria-hidden="true">
            <circle cx="16" cy="16" r="16" className="fill-fg dark:fill-fg-on-ink" />
            <path
              className="fill-accent-fg dark:fill-studio-ink"
              d="M10.2 8.8h2.55v8.35c0 1.82 1.28 3.12 3.25 3.12s3.25-1.3 3.25-3.12V8.8H21.8v8.45c0 3.28-2.48 5.55-5.8 5.55s-5.8-2.27-5.8-5.55V8.8z"
            />
          </svg>
          <span className="text-sm font-medium">Freemock</span>
        </Link>
        <h1 className="text-2xl font-medium tracking-tight">Sign in</h1>
        <p className="mt-1 mb-6 text-sm text-muted dark:text-muted-on-ink">
          Optional — every export is already unlocked.
        </p>
        {authEnabled ? (
          <div className="space-y-2">
            {GROK_PROVIDERS.map((p) => (
              <button
                key={p.providerId}
                type="button"
                onClick={() => signIn(p.providerId, { callbackURL: "/" })}
                className="h-10 w-full rounded-xl border border-line bg-panel text-sm font-medium hover:bg-black/[0.03] dark:border-line-ink dark:bg-panel-ink dark:hover:bg-white/[0.04]"
              >
                Continue with {p.label}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">Sign-in is disabled.</p>
        )}
        <Link
          to="/"
          className="mt-6 inline-block text-sm text-muted hover:text-fg dark:text-muted-on-ink dark:hover:text-fg-on-ink"
        >
          Back to editor
        </Link>
      </div>
    </main>
  );
}
