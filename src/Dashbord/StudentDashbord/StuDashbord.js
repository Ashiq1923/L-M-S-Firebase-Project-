import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Spin, Alert, Avatar, Card } from 'antd';
import { UserOutlined, PhoneOutlined, MailOutlined, IdcardOutlined, BookOutlined } from '@ant-design/icons';
import { db } from '../../config/firebase/firebaseconfig';

const StuDashboard = () => {
  const [studentData, setStudentData] = useState(null);
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
    const fetchStudentData = async () => {
      if (!uid) return;

      try {
        const studentRef = doc(db, 'student', uid);
        const studentSnapshot = await getDoc(studentRef);

        if (studentSnapshot.exists()) {
          setStudentData(studentSnapshot.data());
        } else {
          console.error('No found with the given UID.');
          setStudentData(null);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setStudentData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
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
  if (!studentData) {
    return (
      <div className="flex justify-center items-center ">
        <Alert
          message="No Data Found"
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
          {studentData.name ? studentData.name.charAt(0).toUpperCase() : '?'}
        </Avatar>
        <h2 className="text-xl font-bold mt-4">{studentData.name || 'N/A'}</h2>
<p className="text-gray-500">
  Joined: {studentData.createdAt ? new Date(studentData.createdAt).toLocaleDateString() : 'N/A'}
</p>
      </Card>

      {/* Details Section */}
      <div className="mt-6 space-y-4">
        <div className="flex items-center gap-2">
          <IdcardOutlined className="text-blue-500" />
          <span className="font-semibold">CNIC:</span> {studentData.cnic || 'N/A'}
        </div>

        <div className="flex items-center gap-2">
          <MailOutlined className="text-red-500" />
          <span className="font-semibold">Email:</span> {studentData.email || 'N/A'}
        </div>

        <div className="flex items-center gap-2">
          <PhoneOutlined className="text-green-500" />
          <span className="font-semibold">Phone:</span> {studentData.phone || 'N/A'}
        </div>

        <div className="flex items-center gap-2">
          <BookOutlined className="text-purple-500" />
          <span className="font-semibold">Course:</span> {studentData.course || 'N/A'}
        </div>

        <div className="flex items-center gap-2">
          <UserOutlined className="text-gray-500" />
          <span className="font-semibold">Password:</span> {studentData.password}
        </div>
      </div>
    </div>
  );
};

export default StuDashboard;
