import React from "react";

type AppleSignInButtonProps = {
  label?: string;
  onClick?: () => void;
};

const AppleSignInButton: React.FC<AppleSignInButtonProps> = ({
  label = "Continue with Apple",
  onClick,
}) => {
  const isPlaceholder = !onClick;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
        isPlaceholder
          ? "cursor-not-allowed border-neutral-200 bg-black text-white hover:bg-black focus-visible:ring-black dark:border-neutral-700 dark:bg-white dark:text-black"
          : "border-neutral-200 bg-black text-white hover:bg-neutral-900 focus-visible:ring-black dark:border-neutral-700 dark:bg-white dark:text-black dark:hover:bg-neutral-100"
      }`}
      disabled={isPlaceholder}
    >
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-base text-black dark:bg-black dark:text-white">
        
      </span>
      <span>{label}</span>
      {isPlaceholder && (
        <span className="text-xs font-medium text-white/70 dark:text-black/70">
          (Coming soon)
        </span>
      )}
    </button>
  );
};

export default AppleSignInButton;