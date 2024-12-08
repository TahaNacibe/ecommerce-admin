"use client"
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react';
import SideBar from '../pages/components/sideBar';
import axios from 'axios';

// Type definitions for better type safety
interface User {
  email: string;
  name: string;
  pfp: string;
  role: string;
}

interface ShopSettings {
  name: string;
  icon: string;
}

export default function SettingsPage() {
  // Auth and session management
  const { data: session } = useSession();

  // State management for users and search
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  
  // Loading states
  const [initialLoading, setInitialLoading] = useState(true);
  const [isUpdateLoading, setIsUpdateLoading] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  
  // Shop settings state management
  const [shopSettings, setShopSettings] = useState<ShopSettings>({
    name: '',
    icon: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [tempShopSettings, setTempShopSettings] = useState<ShopSettings>({
    name: '',
    icon: ''
  });
  const [previewIcon, setPreviewIcon] = useState('');

  // Fetch initial data on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [usersResponse, settingsResponse] = await Promise.all([
          axios.get("/api/clients"),
          axios.get("/api/settings")
        ]);
        setUsers(usersResponse.data.users);
        setShopSettings(settingsResponse.data);
        setTempShopSettings(settingsResponse.data);
        setPreviewIcon(settingsResponse.data.icon);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Check if current user is admin
  const isAdmin = users.find((user) => user.email === session?.user?.email)?.role === 'admin';

  // Handle role changes for users
  const handleMakeSubAdmin = async (email: string, role: string) => {
    if (!isAdmin) {
      alert("Only administrators can modify user roles");
      return;
    }

    setIsUpdateLoading(true);
    try {
      await axios.put(`/api/users?role=${role}&email=${email}`);
      setUsers(users.map(user => 
        user.email === email ? { ...user, role } : user
      ));
    } catch (error) {
      console.error("Error updating user role:", error);
    } finally {
      setIsUpdateLoading(false);
    }
  };

  // Handle shop settings updates
  const handleSaveShopSettings = async () => {
    if (!isAdmin) {
      alert("Only administrators can modify shop settings");
      return;
    }

    setIsSavingSettings(true);
    try {
      await axios.put('/api/settings', tempShopSettings);
      setShopSettings(tempShopSettings);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating shop settings:", error);
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Handle icon upload and preview
  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreviewIcon(base64String);
        setTempShopSettings({ ...tempShopSettings, icon: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Loading state UI
  if (initialLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="space-y-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  // Authentication check
  if (!session) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="bg-red-100 p-4 rounded-full inline-block">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m4-6l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Access Denied</h1>
          <p className="text-gray-600">Please sign in to view this page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex bg-gray-50 overflow-hidden h-screen">
      {/* Sidebar */}
      <div className="">
        <SideBar />
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-0 md:ml-20 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Shop Settings Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-shadow hover:shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Shop Settings</h2>
              {isAdmin && (
                <div className="space-x-3">
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Edit Settings
                    </button>
                  ) : (
                    <div className='flex gap-2'>
                      <button
                        onClick={handleSaveShopSettings}
                        disabled={isSavingSettings}
                        className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 flex items-center space-x-2"
                      >
                        {isSavingSettings ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Saving...</span>
                          </>
                        ) : (
                          <span>Save Changes</span>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setTempShopSettings(shopSettings);
                          setPreviewIcon(shopSettings.icon);
                        }}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-6 text-black">
              {/* Shop Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shop Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={tempShopSettings.name}
                    onChange={(e) => setTempShopSettings({ ...tempShopSettings, name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
                    placeholder="Enter shop name"
                  />
                ) : (
                  <p className="text-gray-900 px-4 py-2 bg-gray-50 rounded-lg">{shopSettings.name}</p>
                )}
              </div>

              {/* Shop Icon Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shop Icon
                </label>
                <div className="flex items-center space-x-4">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200">
                      <img
                        src={isEditing ? previewIcon : shopSettings.icon}
                        alt="Shop Icon"
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    {isEditing && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <label htmlFor="icon-upload" className="cursor-pointer p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition-colors">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </label>
                        <input
                          id="icon-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleIconUpload}
                          className="hidden"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* User Management Section */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.email} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              src={user.pfp}
                              alt={user.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === 'admin'
                              ? 'bg-green-100 text-green-800'
                              : user.role === 'sub-admin'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {isAdmin && user.role !== 'admin' && (
                            <button
                              onClick={() => handleMakeSubAdmin(user.email, user.role === 'user' ? 'sub-admin' : 'user')}
                              disabled={isUpdateLoading}
                              className="text-blue-600 hover:text-blue-900 transition-colors disabled:opacity-50"
                            >
                              {isUpdateLoading ? (
                                <div className="w-5 h-5 border-t-2 border-blue-500 animate-spin rounded-full"></div>
                              ) : (
                                user.role === 'user' ? 'Make Sub-Admin' : 'Make User'
                              )}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
  );
}