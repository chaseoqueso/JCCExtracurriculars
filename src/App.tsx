import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import Login from './Login';

type Entry = {
  id: string;
  title: string;
  category: string[];
};

type Role = 'admin' | 'general';

function App() {
  const [user, setUser] = useState<any>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [role, setRole] = useState<Role | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    const getUserAndRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();
        setRole(profile?.role || 'general');
      }
    };
    getUserAndRole();
  }, []);

  useEffect(() => {
    if (user) fetchEntries();
  }, [search, categoryFilter, user]);

  const fetchEntries = async () => {
    let query = supabase.from('entries').select('*');

    if (search.trim() !== '') {
      query = query.ilike('title', `%${search.trim()}%`);
    }

    if (categoryFilter.trim() !== '') {
      const categoryTerm = categoryFilter.trim().toLowerCase();
      query = query.contains('category', [categoryTerm]);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching entries:', error.message);
    } else {
      setEntries(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('entries').insert({
      title,
      category: category.split(',').map(c => c.trim().toLowerCase()),
    });
    if (error) {
      console.error('Insert error:', error);
    } else {
      setTitle('');
      setCategory('');
      fetchEntries();
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Entry Browser</h1>

      {!user ? (
        <Login onLogin={() => window.location.reload()} />
      ) : (
        <>
          <p>Logged in as: {user.email} ({role})</p>

          {role === 'admin' && (
            <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
              <h3>Add New Entry</h3>
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Categories (comma separated)"
                value={category}
                onChange={e => setCategory(e.target.value)}
                required
              />
              <button type="submit">Add Entry</button>
            </form>
          )}

          <h2>All Entries</h2>
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="Search by title"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ marginRight: '1rem' }}
            />
            <input
              type="text"
              placeholder="Filter by category"
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
            />
          </div>
          <ul>
            {entries.map(entry => (
              <li key={entry.id}>
                <strong>{entry.title}</strong> — {entry.category?.join(', ')}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default App;
