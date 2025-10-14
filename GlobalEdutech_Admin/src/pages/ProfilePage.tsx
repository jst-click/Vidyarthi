import React from 'react';
import { User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white rounded-xl p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile Settings</h1>
        <div className="text-center py-8">
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
            <User className="h-16 w-16 text-white" />
          </div>
          <h2 className="text-3xl font-semibold text-gray-800 mb-2">Welcome, {user?.username}!</h2>
          <p className="text-xl text-yellow-600 font-medium mb-6">Role: {user?.role}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Account Information</h3>
          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b border-gray-200">
              <span className="font-medium text-gray-700">Username:</span>
              <span className="text-gray-900">{user?.username}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-200">
              <span className="font-medium text-gray-700">Role:</span>
              <span className="text-gray-900">{user?.role}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-200">
              <span className="font-medium text-gray-700">Status:</span>
              <span className="text-green-600 font-medium">Active</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="font-medium text-gray-700">Last Login:</span>
              <span className="text-gray-900">Just now</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Settings</h3>
          <div className="space-y-4">
            {[
              'Change Password',
              'Update Email',
              'Notification Settings',
              'Privacy Settings'
            ].map((setting, index) => (
              <button
                key={index}
                className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200 hover:border-yellow-300"
              >
                {setting}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-8 shadow-lg text-center">
        <p className="text-gray-600 text-lg">
          Profile management features are yet to be implemented. Here you'll be able to update your 
          personal information, change security settings, manage preferences, and view account activity.
        </p>
        <div className="mt-6">
          <button className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 transform hover:scale-105 shadow-lg">
            Coming Soon
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;


