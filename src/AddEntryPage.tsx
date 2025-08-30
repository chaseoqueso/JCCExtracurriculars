import EntryForm from './EntryForm';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function AddEntryPage() {
  const navigate = useNavigate();

  const handleAdd = async (data: any) => {
    const { error } = await supabase.from('entries').insert(data);
    if (error) {
      console.error(error);
    } else {
      navigate('/');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2 className="text-2xl font-semibold">Add Entry</h2>
      <EntryForm onSubmit={handleAdd} />
    </div>
  );
}
