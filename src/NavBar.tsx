import { Link } from 'react-router-dom';

export default function NavBar({ role }: { role: string | null }) {
  if (role !== 'admin') return null; // only show for admins

  return (
    <nav style={{ padding: '1rem', background: '#eee', marginBottom: '1rem' }}>
      <Link to="/" style={{ marginRight: '1rem' }}>Home</Link>
      <Link to="/add">Add Entry</Link>
    </nav>
  );
}
