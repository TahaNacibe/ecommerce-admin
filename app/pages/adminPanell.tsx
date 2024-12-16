"use client"
import { signIn, useSession } from 'next-auth/react';
import { Loader2, Plus } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import SideBar from './components/sideBar';
import axios from 'axios';


interface User {
  email: string;
  name: string;
  pfp: string;
  role: string;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [usersList, setUsersList] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
    const [isUpdateLoading, setIsUpdateLoading] = useState(false);




  useEffect(() => {
    const getUsersList = async () => {
      try {
        const response = await axios.get("/api/users");
        setUsersList(response.data.users);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    getUsersList();
  }, []);
    
    const isCurrentUserAdmin = () => {
        return usersList.some(user => {
            if (user.email === session?.user?.email) {
                return user.role === "admin"
            }
        })
    } 

  const handleRoleChange = async (email: string, role: string) => {
    setIsUpdateLoading(true);
    try {
      await axios.put(`/api/users?role=${role}&email=${email}`);
      setUsersList(users => 
        users.filter(user => 
          user.email !== email
        )
      );
    } catch (error) {
      console.error("Error updating user role:", error);
    } finally {
      setIsUpdateLoading(false);
    }
  };

  

  const filteredUsers = usersList.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  // Loading Spinner Component
  const LoadingSpinner = ({ size = 'small' }: { size?: 'small' | 'large' }) => (
    <div className='flex justify-center items-center justify-items-center h-full w-screen'>
       <Loader2 
    className={`animate-spin ${
        size === 'large' ? 'h-8 w-8' : 'h-4 w-4'
    } text-blue-600`} 
    />
   </div>
);


  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">Access Denied</h1>
          <p className="text-gray-600 mt-2">Please sign in to view this page</p>
          <button
            onClick={() => signIn("google")}
            className='rounded-lg bg-black px-4 py-3 mt-10 text-white'>
            <h3>Sign In</h3>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-100 flex overflow-hidden">
      <SideBar />
      {loading? <LoadingSpinner /> : <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
            <div className="relative h-32 bg-gradient-to-r from-blue-500 to-blue-600">
              <div className="absolute -bottom-12 left-8">
                <img
                  src={session.user?.image ?? ""}
                  alt="Profile"
                  className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
                />
              </div>
            </div>
            <div className="pt-16 pb-8 px-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {session.user?.name ?? "User"}
                  </h1>
                  <p className="text-gray-600">{session.user?.email}</p>
                </div>
                <span className="px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold">
                  Admin
                </span>
              </div>
            </div>
          </div>

          {/* Users Management Section */}
          <div className="bg-white rounded-xl shadow-md">
            <div className="flex justify-between items-center m-4 pt-6">
                          <h2 className="text-xl font-bold text-gray-800 ">User Management</h2>
                          {/* search */}
                          <div className='flex gap-2'>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <svg
                  className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
                          </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto rounded-lg">
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
                        {!isUpdateLoading ? (
                          user.role !== 'admin' && isCurrentUserAdmin() ?  (
                            <button
                              onClick={() => handleRoleChange(user.email, "user")}
                              className="text-red-600 hover:text-red-900 transition-colors font-medium"
                              disabled={isUpdateLoading}
                            >
                              Remove Sub-Admin
                            </button>
                          ) : null
                        ) : (
                          <div className="w-5 h-5 border-t-2 border-blue-500 animate-spin rounded-full"></div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>}
    </div>
  );
}