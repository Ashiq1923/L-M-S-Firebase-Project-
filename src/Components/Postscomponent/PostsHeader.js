import React, { useState, useRef, useEffect } from 'react';
import AddPostPopup from './AddPostPopup';

const PostsHeader = ({ username }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false); // Sidebar visibility state
  const [postMessage, setPostMessage] = useState(''); // State for post added message
  const sidebarRef = useRef(null);

  const handleAddPostClick = () => {
    setShowPopup(true);
  };

  // Callback function to handle post added success
  const handlePostAdded = (postData) => {
    setPostMessage('Post added successfully');
    setTimeout(() => {
      setPostMessage(''); // Clear the message after 3 seconds
    }, 3000);
  };

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setShowSidebar(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {/* Header */}
      <div className="p-4 mt-[0px] md:fixed md:left-[16%] md:w-[84%] w-full bg-gray-300 flex justify-between items-center">
        {/* Toggle Sidebar Button */}
        <h1 className="text-lg font-semibold">
          <button onClick={() => setShowSidebar(!showSidebar)} className="md:hidden"></button>
          <span className="hidden md:block">Posts</span>
        </h1>
        
        {/* Add Post Button */}
        <button onClick={handleAddPostClick} className="p-2 bg-blue-500 text-white md:rounded rounded-full">
          <span className='md:hidden block'><i className="h-4 w-5 text-xl fa-solid fa-plus"></i></span> 
          <span className='md:block hidden'>+ Add Post</span>
        </button>

        {/* Add Post Popup */}
        {showPopup && <AddPostPopup setShowPopup={setShowPopup} username={username} onPostAdded={handlePostAdded} />}
      </div>

      {/* Show the post added message at the top */}
      {postMessage && (
        <div className="fixed top-0 left-1/2 transform -translate-x-1/2 bg-green-500 text-white p-3 rounded shadow-lg z-50">
          {postMessage}
        </div>
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full bg-slate-800 w-64 transform transition-transform duration-300 ${
          showSidebar ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar content goes here */}
        <div className="p-4 text-white">
          <p className="text-xl font-semibold mb-4">{username}</p>
          <nav>
            <p className="mb-2">Home</p>
            <p className="mb-2">Profile</p>
            <p className="mb-2">Users</p>
          </nav>
        </div>
      </div>
    </>
  );
};

export default PostsHeader;
