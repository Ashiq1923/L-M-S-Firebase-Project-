import React from 'react';

const LogoutConfirmationPopup = ({ showLogoutPopup, handleLogout, setShowLogoutPopup }) => {
  if (!showLogoutPopup) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        <p className="text-lg mb-4">Are you sure you want to logout?</p>
        <div className="flex gap-4 justify-center">
          <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors">
            Yes
          </button>
          <button onClick={() => setShowLogoutPopup(false)} className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition-colors">
            No
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirmationPopup;
