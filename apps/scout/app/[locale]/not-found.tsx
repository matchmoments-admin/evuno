import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-2xl font-semibold text-text">Page not found</h1>
        <p className="text-sm text-text-muted">The page you are looking for does not exist.</p>
        <Link
          href="/"
          className="inline-block px-4 py-2 bg-accent text-bg rounded-consumer font-medium hover:bg-accent-hover transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
