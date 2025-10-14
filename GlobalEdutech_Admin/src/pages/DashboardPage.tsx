import React from 'react';
import { BookOpen, FileText, User } from 'lucide-react';

const DashboardPage: React.FC = () => (
  <div className="space-y-8">
    <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl p-8 text-white shadow-xl">
      <h1 className="text-4xl font-bold mb-3">Welcome to Dashboard</h1>
      <p className="text-yellow-100 text-lg">Manage your educational platform efficiently and effectively</p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {[
        { title: 'Total Courses', value: '24', color: 'from-blue-500 to-blue-600', icon: BookOpen },
        { title: 'Active Tests', value: '12', color: 'from-green-500 to-green-600', icon: FileText },
        { title: 'Study Materials', value: '156', color: 'from-purple-500 to-purple-600', icon: FileText },
        { title: 'Total Students', value: '1,234', color: 'from-orange-500 to-orange-600', icon: User },
      ].map((stat, index) => (
        <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
          <div className={`bg-gradient-to-r ${stat.color} w-14 h-14 rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
            <stat.icon className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</h3>
          <p className="text-gray-600 font-medium">{stat.title}</p>
        </div>
      ))}
    </div>

    <div className="bg-white rounded-xl p-8 shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {['Create New Course', 'Add Test', 'Upload Material'].map((action, index) => (
          <button
            key={index}
            className="p-6 border-2 border-dashed border-gray-300 rounded-xl hover:border-yellow-500 hover:bg-yellow-50 transition-all duration-200 text-gray-600 hover:text-yellow-600 font-medium text-lg group"
          >
            <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">+</div>
            {action}
          </button>
        ))}
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[
            'New student enrolled in Mathematics course',
            'Test results published for Physics exam',
            'Course material updated for Chemistry',
            'New assignment created for Biology'
          ].map((activity, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <p className="text-gray-700">{activity}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 mb-4">System Status</h3>
        <div className="space-y-4">
          {[
            { label: 'Server Status', status: 'Online', color: 'bg-green-500' },
            { label: 'Database', status: 'Connected', color: 'bg-green-500' },
            { label: 'Storage', status: '85% Used', color: 'bg-yellow-500' },
            { label: 'Backup', status: 'Completed', color: 'bg-green-500' }
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-700">{item.label}</span>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 ${item.color} rounded-full`}></div>
                <span className="text-sm text-gray-600">{item.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default DashboardPage;


