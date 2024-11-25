import React from 'react';

const EditProfilePopup = ({ showEditPopup, newUsername, setNewUsername, handleSaveEdit, setShowEditPopup }) => {
  if (!showEditPopup) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center w-[90%] max-w-md">
        <h3 className="text-xl font-bold mb-4">Edit Profile</h3>
        {/* Username Edit Field */}
        <input
          type="text"
          value={newUsername}
          onChange={(e) => setNewUsername(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          placeholder="Enter new username"
        />
        {/* Save Button */}
        <button
          onClick={handleSaveEdit}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default EditProfilePopup;
