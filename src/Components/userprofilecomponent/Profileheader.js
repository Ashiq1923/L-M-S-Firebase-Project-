import React from 'react';

function ProfileHeader({ userData, navigate }) {
  return (
    <div className="flex items-center bg-green-700 md:mt-[1px] md:w-[70%] p-4 rounded shadow-2xl gap-4 mb-6">
      <div className="w-20 h-20 border-2 shadow-2xl border-white rounded-full flex items-center justify-center">
        {userData?.profilePicture ? (
          <img
            src={userData.profilePicture}
            alt="Profile"
            className="w-full h-full rounded-full"
          />
        ) : (
          <span className="text-3xl text-white">
            {userData?.username?.[0]?.toUpperCase() || 'A'}
          </span>
        )}
      </div>
      <div>
        <h2 className="text-2xl font-semibold text-white">
          {userData?.username || 'No Username'}
        </h2>
        <p className="text-sm text-white">{userData?.email || 'No email available'}</p>
        <p className="text-gray-400">
          {userData?.createdAt
            ? `Joined on ${userData.createdAt.toDate().toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}`
            : 'Account creation date not available.'}
        </p>
      </div>
      <button
        onClick={() => navigate('/Allprofile')} // Navigate to Allprofile
        className="mb-[70px] text-[20px] "
      >
        <span className="text-[red] font-bold md:hidden block">X</span>  </button>
    </div>
  );
}

export default ProfileHeader;
