import EntryForm from './EntryForm';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { useState, useEffect } from 'react';

export default function EditEntryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [entry, setEntry] = useState<any>(null);

  useEffect(() => {
    const loadEntry = async () => {
      const { data, error } = await supabase.from('entries').select('*').eq('id', id).single();
      if (!error && data) {
        setEntry(data);
      }
    };
    loadEntry();
  }, [id]);

  const handleUpdate = async (data: any) => {
    const { error } = await supabase.from('entries').update(data).eq('id', id);
    if (error) {
      console.error(error);
    } else {
      navigate('/');
    }
  };

  if (!entry) return <p>Loading...</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Edit Entry</h2>
      <EntryForm initialData={entry} onSubmit={handleUpdate} />
    </div>
  );
}
