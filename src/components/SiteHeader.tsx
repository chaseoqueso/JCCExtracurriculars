import { Link } from 'react-router-dom';

type Props = {
  isAdmin?: boolean;
  onLogout?: () => void;
};

export default function SiteHeader({ isAdmin, onLogout }: Props) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-brand-500 text-white grid place-items-center font-bold">J</div>
          <span className="font-semibold tracking-tight">JCC Extracurriculars</span>
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            to="/"
            className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100"
          >
            Browse
          </Link>

          {isAdmin && (
            <>
              <Link
                to="/add"
                className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100"
              >
                Add Entry
              </Link>
              <Link
                to="/manage-users"
                className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100"
              >
                Manage Users
              </Link>
            </>
          )}

          {onLogout && (
            <button
              onClick={onLogout}
              className="ml-2 px-3 py-2 rounded-lg text-sm font-semibold text-white bg-gray-800 hover:bg-gray-600"
            >
              Log out
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
