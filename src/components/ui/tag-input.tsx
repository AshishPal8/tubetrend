import React, { useState } from "react";
import { X } from "lucide-react";
import { Input } from "./input";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions: string[];
  disabled?: boolean;
}

export const TagInput: React.FC<TagInputProps> = ({
  value,
  onChange,
  suggestions,
  disabled = false,
}) => {
  const [input, setInput] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && input.trim()) {
      e.preventDefault();
      const newTag = input.trim().toLowerCase();
      if (!value.includes(newTag)) {
        onChange([...value, newTag]);
      }
      setInput("");
    }
  };

  const removeTag = (tag: string) => {
    if (disabled) return;
    const updated = value.filter((t) => t !== tag);
    onChange(updated);
  };

  const filteredSuggestions = suggestions.filter(
    (tag) => tag.includes(input.toLowerCase()) && !value.includes(tag)
  );

  const addTag = (tag: string) => {
    onChange([...value, tag]);
    setInput("");
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {value.map((tag) => (
          <span
            key={tag}
            className="bg-gray-200 rounded-full px-2 py-1 flex items-center text-sm"
          >
            {tag}
            {!disabled && (
              <X
                className="ml-2 h-4 w-4 cursor-pointer"
                onClick={() => removeTag(tag)}
              />
            )}
          </span>
        ))}
      </div>
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Press Enter or comma to add tag"
        disabled={disabled}
      />
      {input && filteredSuggestions.length > 0 && (
        <div className="border rounded-md shadow bg-white mt-2 p-2">
          {filteredSuggestions.map((tag) => (
            <div
              key={tag}
              onClick={() => addTag(tag)}
              className="cursor-pointer hover:bg-gray-100 p-1 rounded"
            >
              {tag}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
