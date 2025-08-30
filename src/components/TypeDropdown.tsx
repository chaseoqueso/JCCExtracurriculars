import { Popover } from "@headlessui/react";

type Props = {
  label: string;
  options: string[];
  selected: string[];
  setSelected: (values: string[]) => void;
};

export default function TypeDropdown({ label, options, selected, setSelected }: Props) {
  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      setSelected(selected.filter(o => o !== option));
    } else {
      setSelected([option]);
    }
  };

  return (
    <Popover className="relative">
      <Popover.Button className="px-4 py-2 bg-white text-black rounded-md shadow hover:bg-gray-100">
        {label + " ▼"}
      </Popover.Button>
      
      <Popover.Panel className="absolute z-10 mt-2 w-56 bg-white rounded-lg shadow-lg p-4 text-black">
        <h4 className="font-semibold mb-2">{label}</h4>
        <div className="grid grid-cols-1 gap-2">
          {options.map(option => (
            <label key={option} className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onChange={() => toggleOption(option)}
                className="rounded border-gray-300"
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </Popover.Panel>
    </Popover>
  );
}
