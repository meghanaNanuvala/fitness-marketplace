// ProfilePage.tsx

import React from 'react';

// Define the expected structure for the user prop
interface User {
  name: string;
  email: string;
  phone: string;
  memberSince: string;
}

// Note: If the user is null (not logged in), you might redirect them here
function ProfilePage({ user }: { user: User | null }) {
  
  // Optional: A simple check to ensure the user is logged in
  if (!user) {
    return <div className="p-6 text-red-500">Please log in to view your profile.</div>;
  }
  
  return (
    <div className="p-6 max-w-lg mx-auto bg-white shadow-lg rounded-xl">
      <h2 className="text-3xl font-bold mb-6 text-center text-indigo-600">Your Profile</h2>
      
      <div className="space-y-4">
        <div className="flex justify-between border-b pb-2">
          <span className="font-semibold text-gray-700">Name:</span>
          <span className="text-gray-900">{user.name}</span>
        </div>
        
        <div className="flex justify-between border-b pb-2">
          <span className="font-semibold text-gray-700">Email:</span>
          <span className="text-gray-900">{user.email}</span>
        </div>
        
        <div className="flex justify-between border-b pb-2">
          <span className="font-semibold text-gray-700">Phone:</span>
          <span className="text-gray-900">{user.phone}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="font-semibold text-gray-700">Member Since:</span>
          <span className="text-gray-900">{user.memberSince}</span>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;