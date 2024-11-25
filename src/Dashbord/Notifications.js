import React, { useState, useEffect } from 'react';
import { updateDoc, collection, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { message, Spin } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined, UserOutlined } from '@ant-design/icons';
import { db } from '../config/firebase/firebaseconfig';

function Notifications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState({}); // For individual button loading
  const [hasPending, setHasPending] = useState(false); // State to track if there are pending applications
  const [newDataLoading, setNewDataLoading] = useState(false); // State to track if new data is loading
  const [visibleCount, setVisibleCount] = useState(5); // Number of applications visible at a time

  // Function to fetch user data from the respective collections (students or teachers)
  const fetchUserData = async (uid) => {
    let userData = {};
    try {
      const userRefStudent = doc(db, 'student', uid);
      const userRefTeacher = doc(db, 'teachers', uid);

      const userSnapshotStudent = await getDoc(userRefStudent);
      const userSnapshotTeacher = await getDoc(userRefTeacher);

      if (userSnapshotStudent.exists()) {
        userData = userSnapshotStudent.data();
      } else if (userSnapshotTeacher.exists()) {
        userData = userSnapshotTeacher.data();
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      message.error('Failed to fetch user data');
    }
    return userData;
  };

  // Approve function (update Firestore approved to "approved")
  const handleApprove = async (applicationId, uid) => {
    setButtonLoading((prev) => ({ ...prev, [applicationId]: true }));
    try {
      const applicationRef = doc(db, 'applications', applicationId);
      await updateDoc(applicationRef, { approved: 'approved', status: 'done' });
      const userApplicationRef = doc(db, `your-application/${uid}/applications`, applicationId);
      await updateDoc(userApplicationRef, { approved: 'approved', status: 'done' });

      message.success('Application approved!');
    } catch (error) {
      console.error('Error approving application:', error);
      message.error('Failed to approve the application');
    } finally {
      setButtonLoading((prev) => ({ ...prev, [applicationId]: false }));
    }
  };

  // Reject function (update Firestore approved to "rejected")
  const handleReject = async (applicationId, uid) => {
    setButtonLoading((prev) => ({ ...prev, [applicationId]: true }));
    try {
      const applicationRef = doc(db, 'applications', applicationId);
      await updateDoc(applicationRef, { approved: 'rejected', status: 'done' });

      const userApplicationRef = doc(db, `your-application/${uid}/applications`, applicationId);
      await updateDoc(userApplicationRef, { approved: 'rejected', status: 'done' });

      message.success('Application rejected!');
    } catch (error) {
      console.error('Error rejecting application:', error);
      message.error('Failed to reject the application');
    } finally {
      setButtonLoading((prev) => ({ ...prev, [applicationId]: false }));
    }
  };

  // Real-time listener for applications
// Real-time listener for applications
useEffect(() => {
  const applicationsRef = collection(db, 'applications');

  const unsubscribe = onSnapshot(
    applicationsRef,
    async (querySnapshot) => {
      setNewDataLoading(true); // Start loader when new data is being fetched
     
      // Create an array of promises for fetching user data in parallel
      const userDataPromises = querySnapshot.docs.map(async (docSnapshot) => {
        const applicationData = docSnapshot.data();
        const userData = await fetchUserData(applicationData.uid);

        return {
          id: docSnapshot.id,
          ...applicationData,
          name: userData.name,
          cnic: userData.cnic,
          type: userData.type,
          uid: applicationData.uid,
        };
      });

      try {
        // Wait for all user data fetches to complete in parallel
        const applicationsWithUserData = await Promise.all(userDataPromises);

        // Sort applications so that those with 'processing' status appear first
        applicationsWithUserData.sort((a, b) => {
          if (a.approved === 'processing' && b.approved !== 'processing') {
            return -1; // Move 'processing' applications to the top
          }
          if (a.approved !== 'processing' && b.approved === 'processing') {
            return 1; // Keep non-'processing' applications below
          }
          return 0; // Maintain the current order for the others
        });

        // Set the applications and check if there are pending applications
        setApplications(applicationsWithUserData);
        setHasPending(applicationsWithUserData.some((app) => app.approved === 'processing'));
      } catch (error) {
        console.error('Error fetching applications:', error);
        message.error('Failed to fetch applications');
      } finally {
        setLoading(false);
        setNewDataLoading(false); // Stop loader once data is loaded
      }
    },
    (error) => {
      console.error('Error listening to applications:', error);
      message.error('Failed to listen to applications');
      setLoading(false);
    }
  );

  return () => unsubscribe(); // Cleanup the listener when the component unmounts
}, []);

  // Load more applications when "See More" is clicked
  const handleSeeMore = () => {
    setVisibleCount((prevCount) => prevCount + 6); // Show 6 more applications
  };

  return (
    <div className="p-4 max-w-[102%] mx-auto overflow-auto max-h-[750px]">
      {/* New Data Loading Spinner */}
      {newDataLoading && (
        <div className="absolute top-4 right-4 p-2 bg-gray-600 text-white rounded-xl flex justify-center items-center w-10 h-10 shadow-lg">
          <Spin indicator={<LoadingOutlined style={{ fontSize: 20 }} spin />} />
        </div>
      )}
  
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <Spin indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />} />
        </div>
      ) : applications.length === 0 ? (
        // Display message when there's no data
        <div className="flex justify-center items-center h-32">
          <span className="text-gray-500 text-lg font-semibold">No data available</span>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.slice(0, visibleCount).map((item) => (
            <div key={item.id} className="p-4 border-2 rounded-xl shadow-xl m-4 bg-white">
              <div className="font-semibold">{item.type}</div>
              {/* User Profile */}
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-white text-lg">
                  {item.name ? item.name[0] : <UserOutlined />}
                </div>
                <div className="ml-4">
                  <div className="font-semibold">{item.name}</div>
                  <div className="text-sm text-gray-500">{item.cnic}</div>
                </div>
              </div>
  
              {/* Application Data */}
              <div className="mt-2 text-sm">
                <div> {item.to},</div>
                <div>{item.principal},</div>
                <div>{item.schoolName},</div>
                <div>{item.city},</div>
                <div><strong>Subject:</strong> {item.subject}</div>
                <div className="ml-[80px] mt-1 font-bold break-words whitespace-normal "> {item.body}</div>
                <div className="mt-3"><strong>Applicant Name:</strong> {item.applicantname}</div>
                <div><strong>Class:</strong> {item.class}</div>
                <div><strong>Submitted At:</strong> {item.submittedAt ? item.submittedAt.toDate().toLocaleString() : 'Not Available'}</div>
              </div>
  
              {/* Status */}
              <div className="mt-4">
                <strong>Status:</strong>{' '}
                {item.approved === 'approved' ? (
                  <span className="text-green-500 flex items-center gap-1">
                    <CheckCircleOutlined /> Approved
                  </span>
                ) : item.approved === 'rejected' ? (
                  <span className="text-red-500 flex items-center gap-1">
                    <CloseCircleOutlined /> Rejected
                  </span>
                ) : (
                  <span className="text-yellow-500">Processing</span>
                )}
              </div>
  
              {/* Approve/Reject Buttons */}
              {item.approved === 'processing' && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleApprove(item.id, item.uid)}
                    className="bg-green-500 text-white px-4 py-2 rounded-md flex items-center gap-1"
                    disabled={buttonLoading[item.id]}
                  >
                    {buttonLoading[item.id] ? <LoadingOutlined spin /> : <CheckCircleOutlined />} Approve
                  </button>
                  <button
                    onClick={() => handleReject(item.id, item.uid)}
                    className="bg-red-500 text-white px-4 py-2 rounded-md flex items-center gap-1"
                    disabled={buttonLoading[item.id]}
                  >
                    {buttonLoading[item.id] ? <LoadingOutlined spin /> : <CloseCircleOutlined />} Reject
                  </button>
                </div>
              )}
            </div>
          ))}
          {/* See More Button */}
          {applications.length > visibleCount && (
            <div className="flex justify-center mt-4">
              <button
                onClick={handleSeeMore}
                className="bg-blue-500 text-white px-6 py-2 rounded-md"
              >
                See More
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
  
}

export default Notifications;
