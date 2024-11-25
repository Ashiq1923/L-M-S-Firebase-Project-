import React, { useState, useEffect } from 'react';
import { Menu } from 'antd';
import { collection,getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase/firebaseconfig'; // Import Firestore
import Header from './Student/Header';
import StudentsData from './Student/Studentdata';
import AdminData from './Student/Admindata';
import Register from './Student/Register';

function StudentRegister() {
  const [view, setView] = useState('students');
  const [filteredData, setFilteredData] = useState([]);
  const [searchType, setSearchType] = useState('students'); // Default search type

  // Fetch data from Firestore on search
  const handleSearch = async (searchValue, type) => {
    try {
      setSearchType(type);

      // Determine the collection to search
      const collectionName = type === 'students' ? 'students' : 'admins';
      const dataRef = collection(db, collectionName);

      // If there's a search value, apply Firestore query filters
      const q = query(
        dataRef,
        where('searchFields', 'array-contains', searchValue.toLowerCase())
      );

      const querySnapshot = await getDocs(q);
      const fetchedData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setFilteredData(fetchedData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Fetch all data for initial load based on the current view
  const fetchAllData = async (type) => {
    try {
      const collectionName = type === 'students' ? 'students' : 'admins';
      const dataRef = collection(db, collectionName);

      const querySnapshot = await getDocs(dataRef);
      const fetchedData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setFilteredData(fetchedData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    // Fetch initial data when component loads or view changes
    fetchAllData(view === 'students' ? 'students' : 'admins');
  }, [view]);

  return (
    <div className="p-6">
      {/* Header */}
      <Header
        onSearch={handleSearch}
        menu={
          <Menu>
            <Menu.Item key="1">Students</Menu.Item>
            <Menu.Item key="2">Admin</Menu.Item>
          </Menu>
        }
      />

      {/* Navigation Buttons with Underline */}
      <div className="relative mb-6">
        <div className="flex justify-center space-x-20">
          <button
            className={`text-lg font-medium pb-2 ${
              view === 'students' ? 'text-blue-600' : 'text-gray-500'
            }`}
            onClick={() => setView('students')}
          >
            Students Data
          </button>
          <button
            className={`text-lg font-medium pb-2 ${
              view === 'register' ? 'text-blue-600' : 'text-gray-500'
            }`}
            onClick={() => setView('register')}
          >
            Register
          </button>
          <button
            className={`text-lg font-medium pb-2 ${
              view === 'adminData' ? 'text-blue-600' : 'text-gray-500'
            }`}
            onClick={() => setView('adminData')}
          >
            Admin Data
          </button>
        </div>
        <div
          className={`left-[45%] absolute bottom-0 w-[10%] h-1 bg-blue-600 transition-transform duration-300 ease-in-out transform ${
            view === 'students'
              ? 'translate-x-[-160px]'
              : view === 'register'
              ? 'translate-x-0'
              : 'translate-x-[160px]'
          }`}
        />
      </div>

      {/* Dynamic Content */}
      {view === 'students' && <StudentsData data={filteredData} />}
      {view === 'register' && <Register />}
      {view === 'adminData' && <AdminData data={filteredData} />}
    </div>
  );
}

export default StudentRegister;
