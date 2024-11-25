import React, { useState, useEffect } from 'react';
import { db } from '../config/Firebase/Firebaseconfiguration'; // Update path as needed
import { collection, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';

function Allprofile() {
  const [users, setUsers] = useState([]);
  const [hoveredUser, setHoveredUser] = useState(null); // State to manage "hover" on mobile

  // Fetch users from Firestore
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, 'users');
        const userSnapshot = await getDocs(usersCollection);
        const userList = userSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(userList);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  // Toggle hover state
  const toggleHover = (userId) => {
    setHoveredUser((prev) => (prev === userId ? null : userId));
  };

  // Check if the user is new based on `newUserExpiresAt`
  const isUserNew = (newUserExpiresAt) => {
    const now = new Date();
    const expirationDate = newUserExpiresAt?.toDate(); // Convert Firestore timestamp to JS Date
    return expirationDate && now < expirationDate; // Return true if the current time is before the expiration
  };

  return (
    <div className="w-full md:ml-[19%] ml-[30px] mt-10 px-4">
      <div className='w-[100%] p-4 bg-green-400 text-[red] rounded'>
        <span className='p-[5px] bg-white rounded-2xl'>{users.length}</span> <span className='text-white'>Users</span>
      </div>
      <h1 className="fixed top-0 left-[16%] z-50 text-2xl font-bold bg-slate-200 border-2 p-4 w-[84%]">All Users</h1>

      {/* Container for grid layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-16">
        
        {users.map((user) => (
          <Link
            to={`/Userprofile/${user.id}`}
            key={user.id}
            className={`relative flex flex-col items-center bg-white border rounded-lg shadow-lg p-4 transform transition-transform duration-[0.5s] hover:border-green-700 ${
              hoveredUser === user.id ? 'scale-110 shadow-2xl shadow-gray-900' : ''
            } hover:scale-110 hover:shadow-2xl hover:shadow-gray-900 md:items-start md:flex-row md:space-x-4`}
            onTouchStart={() => toggleHover(user.id)} // Apply hover effect on touch
            onMouseEnter={() => setHoveredUser(user.id)} // Desktop hover
            onMouseLeave={() => setHoveredUser(null)} // Remove hover on mouse leave
          >
            {/* Show red dot for new users */}
            {isUserNew(user.newUserExpiresAt) && (
              <span className="absolute top-1 right-2 rounded p-[3px] text-[10px] font-bold bg-red-500 ">new</span>
            )}
            
            <div className="w-16 h-16 flex items-center justify-center border-2 border-gray-500 text-gray-500 text-2xl font-bold rounded-full mb-4 md:mb-0 md:w-12 md:h-12">
              {user.username ? user.username[0].toUpperCase() : 'U'}
            </div>
            <p className="font-semibold text-gray-800 text-center md:mt-[10px] md:text-left md:flex-grow">{user.username}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Allprofile;
