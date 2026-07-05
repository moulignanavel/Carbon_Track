import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import Button from '@/components/ui/Button';

/**
 * NotFound — 404 page rendered by the catch-all route
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface dark:bg-slate-950 px-4 text-center">
      <Leaf className="mb-4 h-12 w-12 text-green-500" aria-hidden="true" />
      <h1 className="text-6xl font-bold text-slate-900 dark:text-slate-100">404</h1>
      <p className="mt-3 text-lg text-slate-600 dark:text-slate-400">
        This page doesn't exist.
      </p>
      <Link to="/dashboard" className="mt-6">
        <Button variant="primary">Back to dashboard</Button>
      </Link>
    </div>
  );
}
