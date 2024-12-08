import PropertyType from "@/app/models/property_type";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react"



interface PropertiesWidgetProps {
    onPropertiesChange?: (properties: PropertyType[]) => void;
}

export default function PropertiesWidget({ onPropertiesChange }: PropertiesWidgetProps) {
    const [properties, setProperties] = useState<PropertyType[]>([])
    const [currentKey, setCurrentKey] = useState("")
    const [currentValues, setCurrentValues] = useState("")
    const [editingIndex, setEditingIndex] = useState<number | null>(null)
    const [error, setError] = useState<string>("")

    const handleAddProperty = () => {
        if (currentKey.trim() && currentValues.trim()) {
            // Check for duplicate keys
            const isDuplicate = properties.some((prop, idx) => 
                prop.key.toLowerCase() === currentKey.trim().toLowerCase() && 
                idx !== editingIndex
            );

            if (isDuplicate) {
                setError("A property with this key already exists");
                return;
            }

            let updatedProperties;
            if (editingIndex !== null) {
                // Update existing property
                updatedProperties = properties.map((prop, idx) => 
                    idx === editingIndex 
                        ? {
                            key: currentKey.trim(),
                            values: currentValues.split(",").map(v => v.trim()).filter(v => v)
                          }
                        : prop
                );
            } else {
                // Add new property
                updatedProperties = [
                    ...properties,
                    {
                        key: currentKey.trim(),
                        values: currentValues.split(",").map(v => v.trim()).filter(v => v)
                    }
                ];
            }

            setProperties(updatedProperties);
            onPropertiesChange?.(updatedProperties);
            setCurrentKey("");
            setCurrentValues("");
            setEditingIndex(null);
            setError("");
        }
    }

    const handleRemoveProperty = (index: number) => {
        const updatedProperties = properties.filter((_, i) => i !== index);
        setProperties(updatedProperties);
        onPropertiesChange?.(updatedProperties);
        if (editingIndex === index) {
            setEditingIndex(null);
            setCurrentKey("");
            setCurrentValues("");
        }
    }

    const handleEditProperty = (index: number) => {
        const property = properties[index];
        setCurrentKey(property.key);
        setCurrentValues(property.values.join(", "));
        setEditingIndex(index);
        setError("");
    }

    return (
        <div className="space-y-4">
            {/* Add/Edit property section */}
            <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700">
                    {editingIndex !== null ? 'Edit Property' : 'Add Property'}
                </h3>
                <div className="flex gap-3">
                    <div className="flex-1">
                        <input
                            type="text"
                            value={currentKey}
                            onChange={(e) => {
                                setCurrentKey(e.target.value);
                                setError("");
                            }}
                            placeholder="Property name"
                            className={`w-full px-4 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors`}
                        />
                        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
                    </div>
                    <div className="flex-1">
                        <input
                            type="text"
                            value={currentValues}
                            onChange={(e) => setCurrentValues(e.target.value)}
                            placeholder="Values (comma-separated)"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                        />
                    </div>
                    <button
                        onClick={handleAddProperty}
                        className="px-4 py-2 bg-black text-white rounded-lg hover:bg-black/90 transition-colors"
                    >
                        {editingIndex !== null ? 'Update' : 'Add'}
                    </button>
                    {editingIndex !== null && (
                        <button
                            onClick={() => {
                                setEditingIndex(null);
                                setCurrentKey("");
                                setCurrentValues("");
                                setError("");
                            }}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </div>

            {/* Properties list with scrolling */}
            <div className="space-y-2 pr-2">
                {properties.map((property, index) => (
                    <div 
                        key={index} 
                        className="p-3 bg-gray-50/50 rounded-lg border border-gray-200"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium text-gray-700">{property.key}</h3>
                            <div className="flex gap-4 px-2">
                                <button
                                    onClick={() => handleEditProperty(index)}
                                    className="text-blue-500 hover:text-blue-600 focus:outline-none text-sm"
                                >
                                   <Pencil className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => handleRemoveProperty(index)}
                                    className="text-red-500 hover:text-red-600 focus:outline-none text-sm"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {property.values.map((value, valueIndex) => (
                                <span
                                    key={valueIndex}
                                    className="px-2 py-1 bg-white border border-gray-200 rounded-md text-sm text-gray-600"
                                >
                                    {value}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}

                {properties.length === 0 && (
                    <div className="text-center py-4 text-gray-500 text-sm bg-gray-50 rounded-lg">
                        No properties added yet
                    </div>
                )}
            </div>
        </div>
    )
}