"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { Pencil, Trash2, Plus, X, Check, Loader2 } from 'lucide-react';
import SideBar from '../pages/components/sideBar';
import axios from 'axios';
import AutocompleteInput from '../components/tagsSelect';
import DropdownMenu from './components/selectParent';

// Types
interface Category {
  _id: string;
  name: string;
  description?: string;
  parent?: string;
  parentFor?: number;
  usedCount: number;
}

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

// Category Item Component
const CategoryItem = ({
  category,
  categories,
  isEditing,
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
    isEditing: boolean;
    categories: Category[];
  editValue: string;
  editDescription: string;
  onEditChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onParentSelect: (elem: Category) => void;
  loading: boolean;
}) => (
  <div className="flex flex-col p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200">
    <div className="flex items-center justify-between">
      {isEditing ? (
        <div className="flex-1 space-y-2 mr-4">
          <input
            type="text"
            value={editValue}
            onChange={(e) => onEditChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Category name"
            autoFocus
          />
          <input
            type="text"
            value={editDescription}
            onChange={(e) => onDescriptionChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Description (optional)"
          />
        </div>
      ) : (
        <div className="flex-1">
          <span className="text-gray-700 font-medium block">{category.name}</span>
          {category.description && (
            <span className="text-gray-500 text-sm block">{category.description}</span>
          )}
          <span className="text-gray-400 text-xs">Used: {category.usedCount} times</span>
        </div>
      )}
      {/* category */}
      {<DropdownMenu data={categories} isEditing={true} currentCategoryId={category._id} getTheSelected={(item) => {onParentSelect(item)}} />}
      <div className="flex items-center gap-2">
        {isEditing ? (
          <>
            <button
              onClick={onSave}
              disabled={loading}
              className="p-2 text-green-600 hover:text-green-700 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50"
            >
              {loading ? <LoadingSpinner /> : <Check className="h-4 w-4" />}
            </button>
            <button
              onClick={onCancel}
              className="p-2 text-gray-600 hover:text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onEdit}
              className="p-2 text-blue-600 hover:text-blue-700 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={onDelete}
              disabled={loading || category.usedCount > 0}
              className="p-2 text-red-600 hover:text-red-700 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
              title={category.usedCount > 0 ? "Cannot delete category that is in use" : ""}
            >
              {loading ? <LoadingSpinner /> : <Trash2 className="h-4 w-4" />}
            </button>
          </>
        )}
      </div>
    </div>
  </div>
);

// Add Category Modal Component
const AddCategoryModal = ({
  isOpen,
  onClose,
  onAdd,
  onParentSelect,
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
  name: string;
    description: string;
  categories: Category[]
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  loading: boolean;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all duration-200 scale-100">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add New Category</h2>
        </div>
        <div className="p-6 space-y-4 text-black">
          <input
            type="text"
            placeholder="Enter category name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            autoFocus
          />
          <input
            type="text"
            placeholder="Enter description (optional)"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          />
          <DropdownMenu data={categories} isEditing={false} getTheSelected={(elem) => {onParentSelect(elem)}} />
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

  const handleSaveEdit = async (id: string) => {
    if (!editValue.trim()) {
      showNotification('Category name cannot be empty', true);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.put<ApiResponse<Category>>(`/api/category?id=${id}`, {
        name: editValue.trim(),
        description: editDescription.trim(),
        parent:parent?._id
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
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

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
        parent:parent?._id
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
                {categories.map(category => (
                  <CategoryItem
                    key={category._id}
                    categories={categories}
                    category={category}
                    isEditing={editingId === category._id}
                    editValue={editValue}
                    editDescription={editDescription}
                    onEditChange={setEditValue}
                    onDescriptionChange={setEditDescription}
                    onSave={() => handleSaveEdit(category._id)}
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

        <AddCategoryModal
          isOpen={isAddDialogOpen}
          categories={categories}
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
    </section>
  );
};

export default CategoriesPage;