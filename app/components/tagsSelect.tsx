"use client";

import { X } from "lucide-react";
import React, { useState, useEffect } from "react";

// Example data for suggestions
const SUGGESTIONS = [
  "Apple",
  "Banana",
  "Cherry",
  "Date",
  "Grapes",
  "Orange",
  "Pineapple",
  "Strawberry",
  "Watermelon",
];

const AutocompleteInput = () => {
  const [inputValue, setInputValue] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  
  // Filter suggestions based on the input value
  useEffect(() => {
    if (inputValue) {
      const filtered = SUGGESTIONS.filter((item) =>
        item.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setIsDropdownVisible(true);
      setActiveIndex(-1);
    } else {
      setIsDropdownVisible(false);
      setFilteredSuggestions([]);
    }
  }, [inputValue]);

  const handleSelect = (item: any) => {
    if (!selectedItems.includes(item)) {
      setSelectedItems((prev) => [...prev, item]);
    }
    setInputValue("");
    setIsDropdownVisible(false);
  };

  const handleKeyDown = (e : any) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => 
        prev < filteredSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      handleSelect(filteredSuggestions[activeIndex]);
    }
  };

  const handleChange = (e: any) => {
    setInputValue(e.target.value);
  };

  const removeCategory = (index : number) => {
    const newSelected = [...selectedItems];
    newSelected.splice(index, 1);
    setSelectedItems(newSelected);
  };

  return (
    <div className="w-full max-w-md">
          <div className="relative">
              <h3 className="text-black text-sm font-medium pb-1 pl-1">
                  Select Parent
              </h3>
        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Type to search..."
        />

        {/* Dropdown suggestions */}
        {isDropdownVisible && filteredSuggestions.length > 0 && (
          <div className="absolute w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto z-10">
            {filteredSuggestions.map((suggestion, index) => (
              <div
                key={suggestion}
                onClick={() => handleSelect(suggestion)}
                className={`px-4 py-2 cursor-pointer hover:bg-blue-50 transition-colors ${
                  index === activeIndex ? "bg-blue-100" : ""
                }`}
                role="option"
                aria-selected={index === activeIndex}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected items display */}
      <div className="flex flex-wrap gap-2 mt-4 bg-gray-100 p-2 rounded-lg">
        {selectedItems.map((item, index) => (
          <div
            key={`${item}-${index}`}
            className="flex items-center gap-1 px-3 py-1 bg-black text-white rounded-full text-sm"
          >
            <span>{item}</span>
            <button
              onClick={() => removeCategory(index)}
              className="p-1 hover:bg-gray-900 rounded-full transition-colors"
              aria-label={`Remove ${item}`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AutocompleteInput;