import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function EntryMenu({ entryId, onDelete }: { entryId: string; onDelete: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button onClick={() => setOpen(!open)}>⋮</button>
      {open && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            background: '#fff',
            border: '1px solid #ccc',
            zIndex: 10,
            padding: '0.5rem'
          }}
        >
          <Link to={`/edit/${entryId}`} style={{ display: 'block', marginBottom: '0.5rem' }}>
            Edit
          </Link>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this entry?')) {
                onDelete();
              }
            }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
