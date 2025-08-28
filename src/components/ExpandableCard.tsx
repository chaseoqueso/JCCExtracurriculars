import { useState } from "react";
import EntryMenu from "../EntryMenu.tsx";

type Props = {
  entry: {
    id: string;
    title: string;
    tags: string[];
    link: string;
    description: string;
    type: string;
  };
  role: string | null;
  onDelete: () => void;
};

export default function ExpandableCard({ entry, role, onDelete }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white/80 text-black rounded-xl shadow p-4">
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div>
          <h3 className="text-lg font-semibold">{entry.title}</h3>
          <p className="text-sm text-gray-600">{entry.tags?.join(", ")}</p>
        </div>
        <span className="text-gray-500">{expanded ? "▲" : "▼"}</span>
      </div>

      {expanded && (
        <div className="mt-3">
          <p className="text-sm mb-2">{entry.description}</p>
          <p className="text-xs text-gray-500">Type: {entry.type}</p>
          <a
            href={entry.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline text-sm"
          >
            Visit Link
          </a>

          {role === "admin" && (
            <div className="mt-2">
              <EntryMenu entryId={entry.id} onDelete={onDelete} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
