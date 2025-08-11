import { useState, useEffect } from 'react';

export default function EntryForm({ initialData, onSubmit }: {
  initialData?: {
    title: string;
    tags: string[];
    link: string;
    description: string;
    type: string;
  };
  onSubmit: (data: { title: string; tags: string[]; link: string; description: string; type: string }) => void;
}) {
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [link, setLink] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setTags(initialData.tags.join(', '));
      setLink(initialData.link);
      setDescription(initialData.description);
      setType(initialData.type);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Required fields
    if (!title.trim() || !type.trim()) {
        alert('Title and Type are required.');
        return;
    }

    // Optional URL validation
    if (link.trim() !== '') {
        try {
        new URL(link); // throws if invalid
        } catch {
        alert('Please enter a valid URL or leave the Link field empty.');
        return;
        }
    }

    // Prepare data
    onSubmit({
      title: title.trim(),
      tags: tags.trim() === '' ? [] : tags.split(',').map(t => t.trim().toLowerCase()),
      link: link.trim(),
      description: description.trim(),
      type: type.trim()
    });

  };


  return (
    <form onSubmit={handleSubmit}>
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Title"
        required
      />

      <input
        value={link}
        onChange={e => setLink(e.target.value)}
        placeholder="Link (optional)"
        type="url"
      />

      <textarea
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="Description (optional)"
      />

      <input
        value={type}
        onChange={e => setType(e.target.value)}
        placeholder="Type"
        required
      />

      <input
        value={tags}
        onChange={e => setTags(e.target.value)}
        placeholder="Tags (comma separated, optional)"
      />

      <button type="submit">{initialData ? 'Update Entry' : 'Add Entry'}</button>
    </form>
  );
}
