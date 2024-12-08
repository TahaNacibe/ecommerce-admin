"use client";

import axios from "axios";
import { X } from "lucide-react";
import React, { useState, useEffect } from "react";
import Category from "../models/category_interface";

interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

const AutocompleteInput = ({
  response,
  alreadyDefinedCategories,
  isEdit,
}: {
    response: (data: Category[]) => void;
  isEdit: boolean
  alreadyDefinedCategories: Category[] | null;
}) => {
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(true)
  const [filteredSuggestions, setFilteredSuggestions] = useState<Category[]>([]);
  const [selectedItems, setSelectedItems] = useState<Category[]>(alreadyDefinedCategories ?? []);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [categories, setCategories] = useState<Category[]>([]);
  // Fetch categories from the database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get<ApiResponse<Category[]>>("/api/category");
        setCategories(response.data.data || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setIsLoading(false)
      }
    };
    fetchCategories();
  }, []);

  // Update selectedItems based on alreadyDefinedCategories after categories are fetched
  if (isEdit) {
    useEffect(() => {
      if (alreadyDefinedCategories && categories.length > 0) {
        setSelectedItems(
          categories.filter((elem) =>
            alreadyDefinedCategories.some((cat: any) => cat === elem._id)
          )
        );
      }
    }, [categories]);
  }

  // Filter suggestions based on the input value
  useEffect(() => {
    if (inputValue) {
      const filtered = categories.filter((item) =>
        item.name.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredSuggestions(filtered);
      setIsDropdownVisible(true);
      setActiveIndex(-1);
    } else {
      setIsDropdownVisible(false);
      setFilteredSuggestions(categories);
    }
  }, [inputValue, categories]);

  const handleSelect = (item: Category) => {
    if (!selectedItems.some((elem) => elem._id === item._id)) {
      setSelectedItems((prev) => [...prev, item]);
    }
    setInputValue("");
    response([...selectedItems, item]);
    setIsDropdownVisible(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < filteredSuggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      handleSelect(filteredSuggestions[activeIndex]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const removeCategory = (index: number) => {
    const newSelected = [...selectedItems];
    response(newSelected)
    newSelected.splice(index, 1);
    setSelectedItems(newSelected);
  };

  const handleFocus = () => {
    setIsFocused(true);
    setIsDropdownVisible(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  if (isLoading) {
    return (
      <div>
        <h1>
          loading
        </h1>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md text-black">
      <div className="relative">
        <h3 className="text-black text-sm font-medium pb-1 pl-1">Select Parent</h3>
        <input
          type="text"
          value={inputValue}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Type to search..."
        />

        {/* Dropdown suggestions */}
        {isDropdownVisible && filteredSuggestions.length > 0 && (
          <div className="absolute w-full mt-1 bottom-10 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto z-10">
            {filteredSuggestions.map((suggestion, index) => (
              <div
                key={suggestion._id}
                onClick={() => handleSelect(suggestion)}
                className={`px-4 py-2 cursor-pointer hover:bg-blue-50 transition-colors ${
                  index === activeIndex ? "bg-blue-100" : ""
                }`}
                role="option"
                aria-selected={index === activeIndex}
              >
                {suggestion.name}
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Selected items display */}
      <div className="flex flex-wrap gap-2 mt-4 bg-gray-100 p-2 rounded-lg">
        {selectedItems.map((item, index) => (
          <div
            key={`${item._id}-${index}`}
            className="flex items-center gap-1 px-3 py-1 bg-black text-white rounded-full text-sm"
          >
            <span>{item.name}</span>
            <button
              onClick={() => removeCategory(index)}
              className="p-1 hover:bg-gray-900 rounded-full transition-colors"
              aria-label={`Remove ${item.name}`}
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
