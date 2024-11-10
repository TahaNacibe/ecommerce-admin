"use client";
import { ChevronDown } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";


interface Category {
    _id: string;
    name: string;
    description?: string;
    parent?: string;
    parentFor?: number;
    usedCount: number;
  }
  

const DropdownMenu = ({ data, isEditing, currentCategoryId, getTheSelected} : {data:Category[], isEditing: boolean, currentCategoryId?: string | null, getTheSelected: (elem : Category) => void}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement | null>(null);

    let ITEMS: Category[] = data;
    const filteredItems = ITEMS.filter((item) => {
        const isSearched = item.name.toLowerCase().includes(searchTerm.toLowerCase())
        const isNotItSelf = (isEditing && currentCategoryId) ? item._id != currentCategoryId : true
        return isSearched && isNotItSelf
  }
  );

  useEffect(() => {
    const handleClickOutside = (event : any) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
      };
      
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (item : Category) => {
      setSelectedItem(item);
      getTheSelected(item)
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="relative w-full max-w-md" ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 bg-white border rounded-lg flex items-center justify-between hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
      >
        <span className={selectedItem ? "text-gray-900" : "text-gray-500"}>
          {selectedItem?.name || "Select Parent *optional"}
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={`absolute w-full mt-1 bg-white border rounded-lg shadow-lg z-10 text-black ${isEditing? "" : "bottom-12"}`}>
          {/* Search Input */}
          <div className="p-2 border-b">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-auto">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <div
                  key={item._id}
                  onClick={() => handleSelect(item)}
                  className={`px-4 py-2 cursor-pointer hover:bg-blue-50 transition-colors ${
                    selectedItem === item ? "bg-blue-100" : ""
                  }`}
                >
                  {item.name}
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-gray-500 text-center">
                No results found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;