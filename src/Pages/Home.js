import React, { useEffect, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { logout, getDocument, updateDocument } from '../config/Firebase/Firebaseconfiguration';
import { auth } from '../config/Firebase/Firebaseconfiguration';
import Sidebar from '../Components/Sidebar';
import EditProfilePopup from '../Components/EditProfilePopup';
import LogoutConfirmationPopup from '../Components/LogoutConfirmationPopup';
import Posts from '../Dashbord/Posts';
import Yourprofile from '../Dashbord/Yourprofile';
import Allprofile from '../Dashbord/Allprofile';
import Userprofile from '../Dashbord/Userprofile';

function Home() {
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [username, setUsername] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(''); // State to hold success or error messages
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userData = await getDocument('users', user.uid);
          if (userData && userData.username) {
            setUsername(userData.username);
            setNewUsername(userData.username);
          } else {
            setUsername('No Username');
          }
        } else {
          setUsername('No Username');
        }
      } catch (error) {
        console.error('Error fetching username:', error.message);
        setUsername('Error fetching username');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();

    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        fetchUserData();
      } else {
        setUsername('No Username');
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Display message temporarily
  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000); // Clear message after 3 seconds
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      showMessage('Successfully logged out');
    } catch (error) {
      console.error('Logout failed:', error.message);
      showMessage('Logout failed, please try again');
    }
  };

  const handleSaveEdit = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        await updateDocument('users', user.uid, {
          username: newUsername,
        });
        setUsername(newUsername);
        setShowEditPopup(false);
        showMessage('Profile updated successfully');
      }
    } catch (error) {
      console.error('Error updating profile:', error.message);
      showMessage('Failed to update profile');
    }
  };

  return (
    <div className="flex w-[100%]">
      {/* Sidebar Component */}
      <Sidebar
        username={username}
        showEditPopup={showEditPopup}
        setShowEditPopup={setShowEditPopup}
        setShowLogoutPopup={setShowLogoutPopup}
        loading={loading}
      />

      {/* Edit Profile Popup Component */}
      <EditProfilePopup
        showEditPopup={showEditPopup}
        newUsername={newUsername}
        setNewUsername={setNewUsername}
        handleSaveEdit={handleSaveEdit}
      />

      {/* Logout Confirmation Popup Component */}
      <LogoutConfirmationPopup
        showLogoutPopup={showLogoutPopup}
        handleLogout={handleLogout}
        setShowLogoutPopup={setShowLogoutPopup}
      />

      {/* Message Notification */}
      {message && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded shadow-lg z-50">
          {message}
        </div>
      )}

      {/* Content Area */}
      <div className="w-[84%] mt-[80px] h-screen p-4">
        <Routes>
          <Route path='/Home' element={<Posts />} />
          <Route path='/Yourprofile' element={<Yourprofile />} />
          <Route path='/Allprofile' element={<Allprofile />} />
          <Route path='/Userprofile/:id' element={<Userprofile />} />
        </Routes>
      </div>
    </div>
  );
}

export default Home;
