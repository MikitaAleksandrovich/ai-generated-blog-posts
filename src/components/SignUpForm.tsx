import { ChangeEvent, FormEvent, useState } from "react";
import { signUp, type SignUpPayload } from "../services/mockAuthService";

type StatusState = { type: "success" | "error"; message: string } | null;

const initialFormState: SignUpPayload = {
  username: "",
  password: "",
};

function SignUpForm() {
  const [formData, setFormData] = useState(initialFormState);
  const [status, setStatus] = useState<StatusState>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setStatus(null);
    setIsSubmitting(true);

    try {
      const user = await signUp(formData);
      setStatus({
        type: "success",
        message: `Welcome to X, ${user.username}! Your new handle ${user.handle} is ready to launch.`,
      });
      setFormData(initialFormState);
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "We hit a snag while creating your account. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDisabled =
    isSubmitting || !formData.username.trim() || !formData.password.trim();

  return (
    <section className="max-w-md w-full">
      <div className="bg-card-light dark:bg-card-dark border border-slate-200/70 dark:border-slate-700 rounded-3xl shadow-xl p-8">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-widest text-slate-500 dark:text-slate-400 font-semibold">
            Mock onboarding
          </p>
          <h2 className="text-2xl font-bold text-text-light dark:text-text-dark">
            Create your X (Twitter) account
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Claim a handle, secure your account, and preview how onboarding into
            X feels in this sandbox experience.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-semibold text-text-light dark:text-text-dark mb-1.5"
            >
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              inputMode="text"
              autoComplete="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white/80 dark:bg-slate-800/60 px-4 py-3 text-base text-text-light dark:text-text-dark placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-light dark:focus:ring-accent-dark"
              placeholder="@yourhandle"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Letters, numbers, and underscores only.
            </p>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-text-light dark:text-text-dark mb-1.5"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white/80 dark:bg-slate-800/60 px-4 py-3 text-base text-text-light dark:text-text-dark placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-light dark:focus:ring-accent-dark"
              placeholder="At least 6 characters"
            />
          </div>

          {status && (
            <div
              className={`rounded-xl border px-4 py-3 text-sm ${
                status.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-900/30 dark:text-emerald-200"
                  : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-900/30 dark:text-rose-200"
              }`}
              role="status"
              aria-live="polite"
            >
              {status.message}
            </div>
          )}

          <button
            type="submit"
            disabled={isDisabled}
            className="w-full inline-flex items-center justify-center rounded-2xl bg-accent-light dark:bg-accent-dark text-white font-semibold py-3 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Creating your account..." : "Sign up with X"}
          </button>
        </form>
      </div>
    </section>
  );
}

export default SignUpForm;