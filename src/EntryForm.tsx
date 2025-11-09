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
    <form className="flex flex-col py-4 space-y-4" onSubmit={handleSubmit}>
      <div className="flex flex-col space-y-1">
        <label className="font-semibold">
          Title
        </label>
        <input
          className="w-full px-4 py-2 rounded-lg bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Title"
          required
        />
      </div>

      <div className="flex flex-col space-y-1">
        <label className="font-semibold">
          URL
        </label>
        <input
          className="w-full px-4 py-2 rounded-lg bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
          value={link}
          onChange={e => setLink(e.target.value)}
          placeholder="Link (optional)"
          type="url"
        />
      </div>

      <div className="flex flex-col space-y-1">
        <label className="font-semibold">
          Description
        </label>
        <textarea
          className="w-full h-auto min-h-36 px-4 py-2 rounded-lg bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Description (optional)"
        />
      </div>

      <div className="flex flex-col space-y-1">
        <label className="font-semibold">
          Opportunity Type
        </label>
        <input
          className="w-full px-4 py-2 rounded-lg bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
          value={type}
          onChange={e => setType(e.target.value)}
          placeholder="Opportunity Type"
          required
        />
      </div>

      <div className="flex flex-col space-y-1">
        <label className="font-semibold">
          Tags
        </label>
        <input
          className="w-full px-4 py-2 rounded-lg bg-white text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
          value={tags}
          onChange={e => setTags(e.target.value)}
          placeholder="Tags (comma separated, optional)"
        />
      </div>

      <div className="flex pt-6 justify-center">
        <button 
          type="submit"
          className="w-1/5 py-2 rounded-lg bg-secondary-hover hover:bg-secondary transition font-medium disabled:opacity-50"
        >
          {initialData ? 'Update Entry' : 'Add Entry'}
        </button>
      </div>
    </form>
  );
}
