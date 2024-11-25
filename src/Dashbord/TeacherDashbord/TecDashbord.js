import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Spin, Alert, Avatar, Card } from 'antd';
import { UserOutlined, PhoneOutlined, MailOutlined, IdcardOutlined, BookOutlined } from '@ant-design/icons';
import { db } from '../../config/firebase/firebaseconfig';

const TecDashboard = () => {
  const [teacherData, setTeacherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uid, setUid] = useState(null);

  useEffect(() => {
    // Use Firebase Auth listener to fetch UID reliably
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid); // Set UID if the user is logged in
      } else {
        console.error('No logged-in user.');
        setLoading(false); // Stop loading if no user is found
      }
    });

    return () => unsubscribe(); // Clean up the listener on unmount
  }, []);

  useEffect(() => {
    // Fetch teacher data when UID is available
    const fetchTeacherData = async () => {
      if (!uid) return;

      try {
        const teacherRef = doc(db, 'teachers', uid);
        const teacherSnapshot = await getDoc(teacherRef);

        if (teacherSnapshot.exists()) {
          setTeacherData(teacherSnapshot.data());
        } else {
          console.error('No teacher found with the given UID.');
          setTeacherData(null);
        }
      } catch (error) {
        console.error('Error fetching teacher data:', error);
        setTeacherData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, [uid]);

  // Loading State
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  // No Data Found State
  if (!teacherData) {
    return (
      <div className="flex justify-center items-center ">
        <Alert
          message="No Teacher Data Found"
          description="Data is not available."
          type="error"
          showIcon
        />
      </div>
    );
  }

  // Render Teacher Data
  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-gray-100 rounded-lg shadow-lg">
      <Card className="text-center">
        {/* Avatar Section */}
        <Avatar
          size={100}
          style={{ backgroundColor: '#87d068' }}
          icon={<UserOutlined />}
        >
          {teacherData.name ? teacherData.name.charAt(0).toUpperCase() : '?'}
        </Avatar>
        <h2 className="text-xl font-bold mt-4">{teacherData.name || 'N/A'}</h2>
        <p className="text-gray-500">Joined: {teacherData.createdAt?.toDate().toLocaleDateString() || 'N/A'}</p>
      </Card>

      {/* Details Section */}
      <div className="mt-6 space-y-4">
        <div className="flex items-center gap-2">
          <IdcardOutlined className="text-blue-500" />
          <span className="font-semibold">CNIC:</span> {teacherData.cnic || 'N/A'}
        </div>

        <div className="flex items-center gap-2">
          <MailOutlined className="text-red-500" />
          <span className="font-semibold">Email:</span> {teacherData.email || 'N/A'}
        </div>

        <div className="flex items-center gap-2">
          <PhoneOutlined className="text-green-500" />
          <span className="font-semibold">Phone:</span> {teacherData.phone || 'N/A'}
        </div>

        <div className="flex items-center gap-2">
          <BookOutlined className="text-purple-500" />
          <span className="font-semibold">Course:</span> {teacherData.course || 'N/A'}
        </div>

        <div className="flex items-center gap-2">
          <UserOutlined className="text-gray-500" />
          <span className="font-semibold">Password:</span> {teacherData.password}
        </div>
      </div>
    </div>
  );
};

export default TecDashboard;
