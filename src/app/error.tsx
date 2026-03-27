"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-azen-bg flex items-center justify-center p-8">
      <div className="max-w-md text-center">
        <h2 className="text-white text-xl font-semibold mb-2">Something went wrong</h2>
        <p className="text-azen-text text-sm mb-4">
          {error.message || "An unexpected error occurred."}
        </p>
        {error.digest && (
          <p className="text-azen-text/50 text-xs mb-4">Error ID: {error.digest}</p>
        )}
        <button
          onClick={reset}
          className="px-4 py-2 bg-azen-accent text-azen-bg text-sm font-semibold rounded hover:opacity-90 transition-opacity"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
