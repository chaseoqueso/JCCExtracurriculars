import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { Routes, Route, useLocation } from 'react-router-dom';
import Login from './Login';
import AdminRoute from './AdminRoute';
import AddEntryPage from './AddEntryPage';
import EditEntryPage from './EditEntryPage';
import ManageUsersPage from './ManageUsersPage';
import ExpandableCard from './components/ExpandableCard';
import TagDropdown from './components/TagDropdown.tsx';
import TypeDropdown from './components/TypeDropdown.tsx';
import FilterPills from './components/FilterPills';
import Layout from './components/Layout';


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
    <Layout role={role} onLogout={handleLogout}>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <h1 className="text-4xl font-light text-center mb-8">
                JCC Extracurricular Database
              </h1>

              {/* Search + Filters */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-full bg-white text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />

                <TypeDropdown
                  label="Opportunity Type"
                  options={typesList}
                  selected={selectedTypes}
                  setSelected={setSelectedTypes}
                />
                <TagDropdown
                  label="Tags"
                  options={tagsList}
                  selected={selectedTags}
                  setSelected={setSelectedTags}
                />

                <button
                  onClick={() => {
                    setSelectedTypes([]);
                    setSelectedTags([]);
                    setSearch('');
                  }}
                  className="text-sm font-medium underline hover:text-indigo-300"
                >
                  Clear All
                </button>
              </div>

              <FilterPills
                selectedTypes={selectedTypes}
                setSelectedTypes={setSelectedTypes}
                selectedTags={selectedTags}
                setSelectedTags={setSelectedTags}
              />

              {/* Search Results */}
              <h2 className="text-2xl font-light mb-4">Search Results</h2>
              <div className="space-y-4">
                {entries.map(entry => (
                  <ExpandableCard
                    key={entry.id}
                    entry={entry}
                    role={role}
                    onDelete={() => handleDelete(entry.id)}
                  />
                ))}
              </div>
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
    </Layout>
  );
}

export default App;
