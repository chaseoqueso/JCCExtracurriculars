import { Link } from 'react-router-dom';
import logo from '../assets/JCC Logo.png';

type Props = {
  isAdmin?: boolean;
  onLogout?: () => void;
};

export default function SiteHeader({ isAdmin, onLogout }: Props) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="mx-auto max-w-6xl px-4 h-20 flex items-center justify-between">
        <Link to="/" className="flex h-20 items-center gap-2">
          <img className="h-full object-fit:cover" src={logo}></img>
          <h1 className="text-3xl text-primary text-center">
            Extracurricular Database
          </h1>
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            to="/"
            className="px-3 py-2 rounded-lg text-m font-medium hover:bg-gray-100"
          >
            Browse
          </Link>

          {isAdmin && (
            <>
              <Link
                to="/add"
                className="px-3 py-2 rounded-lg text-m font-medium hover:bg-gray-100"
              >
                Add Entry
              </Link>
              <Link
                to="/manage-users"
                className="px-3 py-2 rounded-lg text-m font-medium hover:bg-gray-100"
              >
                Manage Users
              </Link>
            </>
          )}

          {onLogout && (
            <button
              onClick={onLogout}
              className="ml-2 px-3 py-2 rounded-lg text-m font-semibold text-white bg-primary hover:bg-primary-hover"
            >
              Log out
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
