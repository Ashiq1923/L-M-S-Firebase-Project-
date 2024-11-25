import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Sidebar = ({ username, showEditPopup, setShowEditPopup, setShowLogoutPopup, loading, shouldRedirect }) => {
  const [showSidebar, setShowSidebar] = useState(false); // State for sidebar visibility
  const sidebarRef = useRef(null); // Ref for outside click detection
  const navigate = useNavigate();

  useEffect(() => {
    if (shouldRedirect) {
      navigate('/Home');
    }
  }, [navigate, shouldRedirect]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setShowSidebar(false); // Hide sidebar if clicked outside
      }
    };
    document.addEventListener('mousedown', handleClickOutside); // Attach event listener
    return () => document.removeEventListener('mousedown', handleClickOutside); // Clean up
  }, []);

  // Close sidebar after clicking a button
  const closeSidebar = () => {
    setShowSidebar(false); // Close sidebar after delay for animation
  };

  return (
    <div>
      {/* Sidebar Toggle Button */}
      <button
        onClick={() => setShowSidebar(!showSidebar)} // Toggle sidebar state
        className="md:hidden p-2 text-gray-700 fixed top-4 left-4 z-50"
      >
        {showSidebar ? (
          <i className="fa-solid fa-chevron-left text-2xl"></i> // "<" icon when sidebar is open
        ) : (
          <i className="fa-solid fa-bars text-2xl"></i> // Bars icon when sidebar is closed
        )}
      </button>

      {/* Sidebar with sliding transition */}
      <div
        ref={sidebarRef}
        className={`fixed h-screen bg-slate-800 w-[70%] max-w-[250px] transform top-0 left-0 transition-transform duration-300 z-40 ${
          showSidebar ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:w-[30%]`}
      >
        {/* Profile Section */}
        <div className="h-[30%] flex flex-col border-b-2 bg-green-700 p-4 items-center mb-6">
          <div className="relative mt-[30px] w-16 h-16 md:w-20 md:h-20 border-2 md:mt-4 border-white rounded-full flex items-center justify-center mb-2">
            {loading ? (
              <span className="text-3xl text-white">+</span>
            ) : username && username !== 'No Username' ? (
              <span className="text-3xl text-white">{username[0].toUpperCase()}</span>
            ) : (
              <span className="text-3xl text-white">+</span>
            )}
          </div>
          <p className="text-xl text-white font-semibold mb-2">
            {loading ? 'Loading...' : username || 'No Username'}
          </p>
          <button
            onClick={() => {
              setShowEditPopup(true);
              closeSidebar(); // Close sidebar after edit button click
            }}
            className="text-sm text-white mb-4 border p-2 rounded shadow-xl transition-transform duration-300 transform hover:scale-105 hover:shadow-2xl hover:underline"
          >
            Edit Profile
          </button>
          <button
            onClick={() => {
              setShowLogoutPopup(true);
              closeSidebar(); // Close sidebar after logout button click
            }}
            className="md:hidden flex justify-center p-2 rounded-md hover:bg-gray-200 transition-colors duration-200 text-red-600 font-semibold"
          >
            Logout
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex w-[30%] flex-col gap-6 mt-4">
          <Link
            to={'/Home'}
            className="text-lg pr-[200px] w-[100%] flex justify-center m-2 text-white p-2 rounded-md hover:bg-gray-500 transition-colors duration-200"
            onClick={closeSidebar} // Close sidebar when Home is clicked
          >
            <i className="text-xl ml-[90px] mr-[20px] md:ml-[100px] md:mr-[10px] fa-solid fa-house"></i>
            Home
          </Link>
          <Link
            to={'/Yourprofile'}
            className="text-lg pr-[200px] w-[100%] flex justify-center m-2 text-white p-2 rounded-md hover:bg-gray-500 transition-colors duration-200"
            onClick={closeSidebar} // Close sidebar when Profile is clicked
          >
            <i className="text-xl ml-[90px] mr-[20px] md:ml-[100px] md:mr-[10px] fa-solid fa-user"></i>
            Profile
          </Link>
          <Link
            to={'/Allprofile'}
            className="text-lg pr-[200px] w-[100%] flex justify-center m-2 text-white p-2 rounded-md hover:bg-gray-500 transition-colors duration-200"
            onClick={closeSidebar} // Close sidebar when Users is clicked
          >
            <i className="text-xl ml-[90px] mr-[20px] md:ml-[100px] md:mr-[10px] fa-solid fa-users"></i>
            Users
          </Link>
        </nav>

        {/* Logout Button */}
        <button
          onClick={() => {
            setShowLogoutPopup(true);
            closeSidebar(); // Close sidebar after logout button click
          }}
          className="hidden md:mt-[14%] m-2 md:ml-[10%] md:flex justify-center text-xl p-2 rounded-md hover:bg-gray-200 transition-colors duration-200 text-red-600 font-semibold"
        >
          <span className="">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
