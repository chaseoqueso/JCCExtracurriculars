import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { Routes, Route, useLocation } from 'react-router-dom';
import Login from './Login';
import AdminRoute from './AdminRoute';
import NavBar from './NavBar';
import EntryMenu from './EntryMenu';
import AddEntryPage from './AddEntryPage';
import EditEntryPage from './EditEntryPage';
import ManageUsersPage from './ManageUsersPage';
import SiteHeader from './components/SiteHeader';
import PageContainer from './components/PageContainer';

type Entry = {
  id: string;
  title: string;
  tags: string[];
  link: string;
  description: string;
  type: string;
};

type Role = 'admin' | 'general';

function App() {
  const [user, setUser] = useState<any>(null);
  const [allEntries, setAllEntries] = useState<Entry[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [role, setRole] = useState<Role | null>(null);
  const [search, setSearch] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const location = useLocation();
  const typesList = Array.from(new Set(allEntries.map(e => e.type))).sort((a, b) => a.localeCompare(b));
  const tagsList = Array.from(new Set(allEntries.flatMap(e => e.tags))).sort((a, b) => a.localeCompare(b));

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
    if (!user) return;

    const timeoutDuration = 15 * 60 * 1000; // 15 minutes
    let logoutTimer: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(logoutTimer);
      logoutTimer = setTimeout(() => {
        supabase.auth.signOut();
        window.location.reload();
      }, timeoutDuration);
    };

    // Reset on activity
    const events = ['mousemove', 'keydown', 'mousedown', 'scroll', 'touchstart'];
    events.forEach(event =>
      window.addEventListener(event, resetTimer)
    );

    resetTimer(); // start timer initially

    return () => {
      clearTimeout(logoutTimer);
      events.forEach(event =>
        window.removeEventListener(event, resetTimer)
      );
    };
  }, [user]);

  useEffect(() => {
    if (user) {
      if (location.pathname === '/') {
        fetchFilteredEntries();
      }
      fetchAllEntries();
    }
  }, [user, search, selectedTypes, selectedTags, location.pathname]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('entries-changes')
      .on(
        'postgres_changes',
        {
          event: '*', 
          schema: 'public',
          table: 'entries'
        },
        () => {
          fetchFilteredEntries();
          fetchAllEntries();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);


  const fetchAllEntries = async () => {
    const { data, error } = await supabase.from('entries').select('*');
    if (error) {
      console.error('Error fetching all entries:', error.message);
    } else {
      setAllEntries(data);
    }
  };

  const fetchFilteredEntries = async () => {
    let query = supabase.from('entries').select('*');

    if (search.trim() !== '') {
      const searchTerm = `%${search.trim()}%`;
      
      query = query.or(
        `title.ilike.${searchTerm},description.ilike.${searchTerm},type.ilike.${searchTerm},tags.cs.{${search.trim().toLowerCase()}}`
      );
    }

    if (selectedTypes.length > 0) {
      query = query.in('type', selectedTypes);
    }

    if (selectedTags.length > 0) {
      query.contains("tags", selectedTags)
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching entries:', error.message);
    } else {
      setEntries(data);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload(); // or setUser(null) if using state
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('entries').delete().eq('id', id);
    if (error) {
      console.error('Error deleting entry:', error);
    } else {
      fetchFilteredEntries();
      fetchAllEntries();
    }
  };


  if (!user) {
    return <Login onLogin={() => window.location.reload()} />;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Entry Browser</h1>

      {!user ? (
        <Login onLogin={() => window.location.reload()} />
      ) : (
        <>
          <p>
            Logged in as: {user.email} ({role}){' '}
            <button onClick={handleLogout} style={{ marginLeft: '1rem' }}>
              Logout
            </button>
          </p>

          <NavBar role={role} />

          <Routes>
            <Route
              path="/"
              element={
                <>
                  <h2>All Entries</h2>
                  <div style={{ marginBottom: '1rem' }}>
                    <input
                      type="text"
                      placeholder="Search by title"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      style={{ marginRight: '1rem' }}
                    />
                  </div>
                  <details style={{ marginRight: '1rem', display: 'inline-block' }}>
                    <summary>Filter by Type</summary>
                    {typesList.map(type => (
                      <label key={type} style={{ display: 'block' }}>
                        <input
                          type="checkbox"
                          checked={selectedTypes.includes(type)}
                          onChange={e => {
                            if (e.target.checked) {
                              setSelectedTypes([...selectedTypes, type]);
                            } else {
                              setSelectedTypes(selectedTypes.filter(t => t !== type));
                            }
                          }}
                        />
                        {type}
                      </label>
                    ))}
                  </details>
                  <details style={{ display: 'inline-block' }}>
                    <summary>Filter by Tag</summary>
                    {tagsList.map(tag => (
                      <label key={tag} style={{ display: 'block' }}>
                        <input
                          type="checkbox"
                          checked={selectedTags.includes(tag)}
                          onChange={e => {
                            if (e.target.checked) {
                              setSelectedTags([...selectedTags, tag]);
                            } else {
                              setSelectedTags(selectedTags.filter(t => t !== tag));
                            }
                          }}
                        />
                        {tag}
                      </label>
                    ))}
                  </details>
                  <ul>
                    {entries.map(entry => (
                      <li key={entry.id}>
                        <strong>
                            <a 
                              href={entry.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ color: 'inherit', textDecoration: 'underline' }}
                            >
                              {entry.title}
                            </a>
                          </strong> — {entry.tags?.join(', ')}
                        <p>{entry.description}</p>
                        <em>Type: {entry.type}</em>

                        {role === 'admin' && (
                          <EntryMenu
                            entryId={entry.id}
                            onDelete={() => handleDelete(entry.id)}
                          />
                        )}
                      </li>
                    ))}
                  </ul>
                </>
              }
            />
            <Route
              path="/add"
              element={
                <AdminRoute role={role}>
                  <AddEntryPage />
                </AdminRoute>
              }
            />
            <Route
              path="/edit/:id"
              element={
                <AdminRoute role={role}>
                  <EditEntryPage />
                </AdminRoute>
              }
            />
            <Route
              path="/manage-users"
              element={
                <AdminRoute role={role}>
                  <ManageUsersPage />
                </AdminRoute>
              }
            />
          </Routes>

        </>
      )}
    </div>
  );
}

export default App;
