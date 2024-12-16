"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { Pencil, Trash2, Plus, X, Check, Loader2, ArrowRight, Save } from 'lucide-react';
import SideBar from '../pages/components/sideBar';
import axios from 'axios';
import DropdownMenu from './components/selectParent';
import PropertiesWidget from './components/properties';
import PropertyType from '../models/property_type';
import Category from '../models/category_interface';
import { useSession } from 'next-auth/react';
import UnauthenticatedPage from '../unauthorized/page';
import { DeleteConfirmDialog } from '../dialogs/delete_confirm';

// Types


interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

// Notification Component
const Notification = ({ message, type }: { message: string; type: 'error' | 'success' }) => (
  <div className={`mb-4 p-4 rounded-lg ${
    type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 
    'bg-green-50 text-green-600 border border-green-200'
  } transition-all duration-300 ease-in-out`}>
    {message}
  </div>
);

// Loading Spinner Component
const LoadingSpinner = ({ size = 'small' }: { size?: 'small' | 'large' }) => (
  <Loader2 
    className={`animate-spin ${
      size === 'large' ? 'h-8 w-8' : 'h-4 w-4'
    } text-blue-600`} 
  />
);

// Enhanced Category Item Component with improved hierarchy and data visualization
const CategoryItem = ({
  category,
  categories,
  isEditing,
  index,
  editValue,
  editDescription,
  onEditChange,
  onDescriptionChange,
  onSave,
  onCancel,
  onEdit,
  onDelete,
  onParentSelect,
  loading
}: {
  category: Category;
  categories: Category[];
  isEditing: boolean;
  editValue: string;
  index: number;
  editDescription: string;
  onEditChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onSave: (properties:PropertyType[]) => void;
  onCancel: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onParentSelect: (elem: Category) => void;
  loading: boolean;
  }) => {
  
  
  const parentCategory = categories.find(c => c._id === category.parent);
  const childCategories = categories.filter(c => c.parent === category._id);

  const [expandedList, setExpandedList] = useState<number[]>([]);
  const initialProperties: any[] = category.properties ?? [];
  const [properties, setProperties] = useState<PropertyType[]>(initialProperties);

  const manageExpanded = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event bubbling
    setExpandedList(prev =>
      prev.includes(index) ? prev.filter(item => item !== index) : [...prev, index]
    );
  };

  const handleKeyChange = (propertyIndex: number, value: string) => {
    setProperties(prevProperties => {
      const newProperties = [...prevProperties];
      newProperties[propertyIndex].key = value;
      return newProperties;
    });
  };

  const handleValuesChange = (propertyIndex: number, value: string) => {
    const valuesArray = value.split(',').map(val => val.trim());
    setProperties(prevProperties => {
      const newProperties = [...prevProperties];
      newProperties[propertyIndex].values = valuesArray;
      return newProperties;
    });
  };

  const addProperty = (e: React.MouseEvent) => {
    e.stopPropagation();
    setProperties(prevProperties => [...prevProperties, { key: '', values: [] }]);
  };

  const checkIfIndexInList = () => {
    return expandedList.includes(index);
  };

  const removeProperty = (propertyIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setProperties(prevProperties => prevProperties.filter((_, idx) => idx !== propertyIndex));
  };


  return (
    <div
      onClick={(e) => manageExpanded(e)}
      className="flex flex-col p-4 text-black bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200"
    >
      <div className="flex flex-col space-y-3">
        {/* Main content area */}
        <div className="flex items-start justify-between">
          {isEditing ? (
            <div className="flex-1 space-y-6 bg-white rounded-lg p-6 shadow-sm">
              {/* Category Name */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 block">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => onEditChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Enter category name"
                  autoFocus
                />
              </div>
              
              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 block">
                  Description
                  <span className="text-gray-400 font-normal ml-1">(Optional)</span>
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => onDescriptionChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all min-h-[100px]"
                  placeholder="Add a description for this category..."
                />
              </div>
              
              {/* Properties Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-700">Properties</label>
                  <button
                    onClick={addProperty}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Property
                  </button>
                </div>
                
                <div className="space-y-4">
                  {properties.map((prop, idx) => (
                    <div
                      key={idx}
                      className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200 group"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Key Input */}
                      <div className="flex-1">
                        <label className="text-sm font-medium text-gray-600 block mb-1">
                          Key
                        </label>
                        <input
                          type="text"
                          value={prop.key}
                          onChange={(e) => handleKeyChange(idx, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                          placeholder="Enter key"
                        />
                      </div>

                      {/* Values Input */}
                      <div className="flex-1">
                        <label className="text-sm font-medium text-gray-600 block mb-1">
                          Values
                          <span className="text-gray-400 text-xs ml-1">(comma-separated)</span>
                        </label>
                        <input
                          type="text"
                          value={prop.values.join(', ')}
                          onChange={(e) => handleValuesChange(idx, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                          placeholder="Enter values, separated by commas"
                        />
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={(e) => removeProperty(idx, e)}
                        className="mt-7 p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Remove property"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={onCancel}
                  className="px-4 py-2 text-gray-600 hover:text-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onSave(properties)}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            /* Display mode */
            <div className="flex-1 space-y-2 ">
                {/* Category name and desc */}
              <div className='flex flex-row gap-2 justify-between'>
                <div>
                <div className="flex items-center space-x-2 bg-black/5 rounded-lg">
                <span className="text-black px-2 font-medium text-lg">{category.name}</span>
                </div>
              
                {/* Description */}
                {category.description && (
                <p className=" text-sm font-extralight text-gray-400 pt-1 pl-1">{category.description}</p>
                )}
                  </div>


                  {/* Category statistics */}
                  <div className="flex items-center space-x-4 text-sm">
                  {parentCategory && (
                  <div className="flex items-center text-sm text-blue-500 bg-blue-50 px-2 py-1 rounded">
                    <span>Parent:</span>
                    <ArrowRight className="h-4 w-4 mx-1" />
                    <span className="font-medium">{parentCategory.name}</span>
                  </div>
                )}
                <div className="flex items-center text-green-500 bg-green-50 px-2 py-1 rounded">
                  <span className="font-medium">in use with {category.usedCount}</span>
                  <span className="ml-1">Products</span>
                </div>
                {childCategories.length > 0 && (
                  <div className="flex items-center text-sm text-gray-500 bg-gray-50 px-2 py-1 rounded">
                    <span className="font-medium">{childCategories.length}</span>
                    <span className="ml-1">subcategories</span>
                  </div>
                )}
              </div>
                </div>
                {/* the properties section */}
                <div className={`mt-4 transition-all duration-500 overflow-hidden ${
          checkIfIndexInList() ? 'opacity-100 max-h-[1000px]' : 'opacity-0 max-h-0'
        }`}>
      <h2 className="text-lg font-semibold text-gray-900 mb-3">Properties</h2>
      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Key</th>
              <th className="w-8"></th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Values</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {category.properties?.map(({ key, values }, index) => (
              <tr 
                key={`${key}-${index}`}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3 text-sm text-gray-900">
                  <span className="inline-flex items-center px-2.5 py-1.5 rounded-md bg-gray-100 text-gray-800 font-medium">
                    {`${key}`}
                  </span>
                </td>
                <td className="w-8">
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {values.map((value, index: number) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-1.5 rounded-md bg-blue-50 text-blue-700 text-sm font-medium"
                      >
                        {`${value}`}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
            </div>
          )}
          {/* Right side controls */}
          <div className="flex items-center space-x-4 border-l border-dashed border-black/30 pl-4 ml-2">
            {/* Parent category selector */}
            {isEditing && (
              <div className="min-w-[200px]">
                <label className="text-sm font-medium text-gray-700 block mb-1">Parent Category</label>
                <DropdownMenu 
                  data={categories.filter(c => c._id !== category._id)} // Prevent self-selection
                  isEditing={true}
                  currentCategoryId={category._id}
                  getTheSelected={onParentSelect}
                />
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={() => onSave(properties)}
                    disabled={loading || !editValue.trim()}
                    className="p-2 text-green-600 hover:text-green-700 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50"
                    title="Save changes"
                  >
                    {loading ? <LoadingSpinner /> : <Check className="h-5 w-5" />}
                  </button>
                  <button
                    onClick={onCancel}
                    className="p-2 text-gray-600 hover:text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    title="Cancel editing"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={onEdit}
                    className="p-2 text-blue-600 hover:text-blue-700 rounded-lg hover:bg-blue-50 transition-colors"
                    title="Edit category"
                  >
                    <Pencil className="h-5 w-5" />
                    </button>
                    <DeleteConfirmDialog triggerButton={
                      <button
                      // onClick={onDelete}
                      disabled={loading || category.usedCount > 0 || childCategories.length > 0}
                      className="p-2 text-red-600 hover:text-red-700 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                      title={
                        category.usedCount > 0 
                          ? "Cannot delete category that is in use" 
                          : childCategories.length > 0
                            ? "Cannot delete category with subcategories"
                            : "Delete category"
                      }
                    >
                      {loading ? <LoadingSpinner /> : <Trash2 className="h-5 w-5" />}
                    </button>
                    } title={'Are You sure?'} description={`are you sure you want to delete "${category.name}" category?`} confirmAction={onDelete} />
                  
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
// Add Category Modal Component
const AddCategoryModal = ({
  isOpen,
  onClose,
  onAdd,
  onParentSelect,
  onPropertiesSet,
  name,
  description,
  onNameChange,
  onDescriptionChange,
  categories,
  loading
}: {
  isOpen: boolean;
  onClose: () => void;
    onAdd: () => void;
    onParentSelect: (item: Category) => void;
    onPropertiesSet: (item: PropertyType[]) => void;
  name: string;
    description: string;
  categories: Category[]
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  loading: boolean;
}) => {
  if (!isOpen) return null;

  return (
    <div className=" animate-fadeIn">
      <div className="bg-white rounded-lg w-full transform transition-all duration-200 scale-100">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add New Category</h2>
        </div>
        <div className="p-6 space-y-4 text-black">

          {/* the category name */}
          <input
            type="text"
            placeholder="Enter category name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            autoFocus
          />

          {/* the category description */}
          <input
            type="text"
            placeholder="Enter description (optional)"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          />

          {/* category parent */}
          <DropdownMenu data={categories} isEditing={true} getTheSelected={(elem) => { onParentSelect(elem) }} />
          
          {/* category properties */}
          <PropertiesWidget onPropertiesChange={(properties: PropertyType[]) => {
            onPropertiesSet(properties)
          }} />

          {/* the rest of the ui */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onAdd}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? <LoadingSpinner /> : <Plus className="h-4 w-4" />}
              Add Category
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


// Main Component
const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [parent, setParent] = useState<Category>();
  const [propertiesData, setProperties] = useState<PropertyType[] | null>(null)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const showNotification = useCallback((message: string, isError = false) => {
    if (isError) {
      setError(message);
      setSuccess('');
    } else {
      setSuccess(message);
      setError('');
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get<ApiResponse<Category[]>>('/api/category');
      setCategories(response.data.data || []);
    } catch (err: any) {
      showNotification(err.response?.data?.error || 'Failed to fetch categories', true);
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleEdit = (id: string, currentName: string, currentDescription: string = '') => {
    setEditingId(id);
    setEditValue(currentName);
    setEditDescription(currentDescription);
  };

  const handleSaveEdit = async (id: string, properties: PropertyType[]) => {
    if (!editValue.trim()) {
      showNotification('Category name cannot be empty', true);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.put<ApiResponse<Category>>(`/api/category?id=${id}`, {
        name: editValue.trim(),
        description: editDescription.trim(),
        parent: parent?._id,
        properties: properties
      });
      
      if (response.data.data) {
        setCategories(prev => 
          prev.map(cat => cat._id === id ? response.data.data! : cat)
        );
        showNotification('Category updated successfully');
      }
      setEditingId(null);
      setEditValue('');
      setEditDescription('');
    } catch (err: any) {
      showNotification(err.response?.data?.error || 'Failed to update category', true);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      await axios.delete(`/api/category?id=${id}`);
      setCategories(prev => prev.filter(cat => cat._id !== id));
      showNotification('Category deleted successfully');
    } catch (err: any) {
      showNotification(err.response?.data?.error || 'Failed to delete category', true);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      showNotification('Category name cannot be empty', true);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post<ApiResponse<Category>>('/api/category', {
        name: newCategory.trim(),
        description: newDescription.trim(),
        parent: parent?._id,
        properties: propertiesData
      });
      
      if (response.data.data) {
        setCategories(prev => [...prev, response.data.data!]);
        setNewCategory('');
        setNewDescription('');
        setIsAddDialogOpen(false);
        showNotification('Category added successfully');
      }
    } catch (err: any) {
      showNotification(err.response?.data?.error || 'Failed to add category', true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const session = useSession()
    {/* in case of unauthenticated access break his back */ }
    if (session.status === "loading") {
        return 
    }
    if (session.status === "unauthenticated") {
        return (<UnauthenticatedPage />)
    }

  return (
    <section className="bg-gray-50 w-full h-screen flex flex-row overflow-hidden">
      <SideBar />
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-full mx-auto bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
            <button
              onClick={() => setIsAddDialogOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Category
            </button>
          </div>
          {/* add category section */}
          <div className={`${isAddDialogOpen? "opacity-100" : "opacity-0"} duration-500`}>

          <AddCategoryModal
          isOpen={isAddDialogOpen}
          categories={categories}
              onPropertiesSet={(properties) => {
               setProperties(properties)
          }}
          onClose={() => {
            setIsAddDialogOpen(false);
            setNewCategory('');
            setNewDescription('');
          }}
          onAdd={handleAddCategory}
          name={newCategory}
          description={newDescription}
          onNameChange={setNewCategory}
          onDescriptionChange={setNewDescription}
          onParentSelect={(elem) => setParent(elem)}
          loading={loading}
        />
          </div>
          <div className="p-6">
            {(error || success) && (
              <Notification
                message={error || success}
                type={error ? 'error' : 'success'}
              />
            )}

            {loading && categories.length === 0 ? (
              <div className="flex justify-center items-center p-8">
                <LoadingSpinner size="large" />
              </div>
            ) : (
              <div className="space-y-3">
                {categories.map((category, index) => (
                  <CategoryItem
                    key={category._id}
                    index={index}
                    categories={categories}
                    category={category}
                    isEditing={editingId === category._id}
                    editValue={editValue}
                    editDescription={editDescription}
                    onEditChange={setEditValue}
                    onDescriptionChange={setEditDescription}
                    onSave={(properties) => handleSaveEdit(category._id,properties)}
                    onCancel={() => {
                      setEditingId(null);
                      setEditValue('');
                      setEditDescription('');
                    }}
                    onEdit={() => handleEdit(category._id, category.name, category.description)}
                    onDelete={() => handleDelete(category._id)}
                    onParentSelect={(elem) => setParent(elem)}
                    loading={loading}
                  />
                ))}
                {categories.length === 0 && !loading && (
                  <div className="text-center py-8 text-gray-500">
                    No categories found. Click "Add Category" to create one.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        
      </div>
    </section>
  );
};

export default CategoriesPage;