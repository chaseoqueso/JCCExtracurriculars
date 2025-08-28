type Props = {
  selectedTypes: string[];
  setSelectedTypes: (values: string[]) => void;
  selectedTags: string[];
  setSelectedTags: (values: string[]) => void;
};

export default function FilterPills({
  selectedTypes,
  setSelectedTypes,
  selectedTags,
  setSelectedTags,
}: Props) {
  const removeType = (type: string) =>
    setSelectedTypes(selectedTypes.filter(t => t !== type));

  const removeTag = (tag: string) =>
    setSelectedTags(selectedTags.filter(t => t !== tag));

  if (selectedTypes.length === 0 && selectedTags.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {selectedTypes.map(type => (
        <span
          key={type}
          className="flex items-center px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm"
        >
          {type}
          <button
            onClick={() => removeType(type)}
            className="ml-2 text-indigo-500 hover:text-indigo-700"
          >
            ✕
          </button>
        </span>
      ))}

      {selectedTags.map(tag => (
        <span
          key={tag}
          className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
        >
          {tag}
          <button
            onClick={() => removeTag(tag)}
            className="ml-2 text-green-500 hover:text-green-700"
          >
            ✕
          </button>
        </span>
      ))}
    </div>
  );
}
