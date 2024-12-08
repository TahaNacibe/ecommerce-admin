// categoryPropertyHandlers.ts
import { useState, useEffect } from 'react';

interface Property {
  key: string;
  values: string[];
}

interface Category {
  _id: string;
  name: string;
  description?: string;
  properties?: Property[];
}

export const usePropertyHandlers = (initialCategory: Category) => {
  const [properties, setProperties] = useState<Property[]>(
    initialCategory.properties || []
  );

  useEffect(() => {
    setProperties(initialCategory.properties || []);
  }, [initialCategory]);

  const handleKeyChange = (index: number, newKey: string) => {
    const updatedProperties = [...properties];
    updatedProperties[index] = {
      ...updatedProperties[index],
      key: newKey
    };
    setProperties(updatedProperties);
  };

  const handleValuesChange = (index: number, valuesString: string) => {
    const values = valuesString
      .split(',')
      .map(value => value.trim())
      .filter(value => value !== '');

    const updatedProperties = [...properties];
    updatedProperties[index] = {
      ...updatedProperties[index],
      values
    };
    setProperties(updatedProperties);
  };

  const addProperty = () => {
    setProperties([...properties, { key: '', values: [] }]);
  };

  const removeProperty = (index: number) => {
    setProperties(properties.filter((_, i) => i !== index));
  };

  const updateCategory = () => {
    // Filter out empty properties
    const validProperties = properties.filter(
      prop => prop.key.trim() !== '' && prop.values.length > 0
    );
    
    return {
      ...initialCategory,
      properties: validProperties
    };
  };

  return {
    properties,
    handleKeyChange,
    handleValuesChange,
    addProperty,
    removeProperty,
    updateCategory
  };
};