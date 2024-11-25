import React, { useState } from 'react';
import { Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase/firebaseconfig'; // Ensure this is the correct path to your Firebase configuration file
import { Layout, Menu, Button, Modal } from 'antd';
import {
  UserAddOutlined,
  BookOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  LogoutOutlined,
  NotificationOutlined,
  BellOutlined,
} from '@ant-design/icons';
import Studentregister from '../Dashbord/Studentregister'; // Import Studentregister
import Courses from '../Dashbord/Courses'; // Placeholder for Courses
import Results from '../Dashbord/Results'; // Placeholder for Results
import Teachers from '../Dashbord/Teachers'; // Placeholder for Teachers
import RegisterForm from '../Dashbord/Student/Header';
import Notifications from '../Dashbord/Notifications';
import TeachersRig from '../Dashbord/Teachers';
import Studentdashbord from './Studentdashbord';

const { Sider, Content } = Layout;

function Home() {
  const location = useLocation(); // Get the current route
  const navigate = useNavigate(); // Used to navigate to the login page after logout
  const [selectedKey, setSelectedKey] = useState(location.pathname); // Track active menu key

  // Modal visibility state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // State for loading spinner
  const [hasPendingApplications, setHasPendingApplications] = useState(false); // Track if there are pending applications

  // Update active menu key when route changes
  React.useEffect(() => {
    setSelectedKey(location.pathname);
  }, [location]);

  // Handle logout
  const handleLogout = () => {
    // Show the modal asking for confirmation
    setIsModalVisible(true);
  };

  // Handle "Yes" in modal (start logout process)
  const confirmLogout = () => {
    setIsLoading(true); // Start loading spinner
    setTimeout(() => {
      // Simulate a delay before logging out
      setIsModalVisible(false);
      setIsLoading(false); // Stop loading spinner
      navigate('/'); // Redirect to login page
    }, 2000); // 2 seconds for the loading effect
  };

  // Handle "No" in modal (close the modal)
  const cancelLogout = () => {
    setIsModalVisible(false); // Simply close the modal
  };
  React.useEffect(() => {
    const applicationsRef = collection(db, 'applications');
  
    const unsubscribe = onSnapshot(
      applicationsRef,
      async (querySnapshot) => {
        let hasPending = false;
  
        // Loop through applications to check their status
        querySnapshot.docs.forEach((docSnapshot) => {
          const applicationData = docSnapshot.data();
          if (applicationData.approved === 'processing') {
            hasPending = true; // If any application is 'processing', set hasPending to true
          }
        });
  
        // Update the state to show or hide the bell icon based on pending status
        setHasPendingApplications(hasPending);
      },
      (error) => {
        console.error('Error listening to applications:', error);
      }
    );
  
    return () => unsubscribe(); // Cleanup the listener when the component unmounts
  }, []);
  
  return (
    <Layout className="min-h-screen">
      {/* Sidebar */}
      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        className="bg-gray-900"
      >
        <div className="logo py-4 text-center text-white text-lg font-bold">
          Welcome To (LMS)
        </div>
        <Menu
          theme="dark"
          mode="inline"
          className="bg-gray-900"
          selectedKeys={[selectedKey]} // Highlight active menu
          onClick={(e) => setSelectedKey(e.key)} // Update state on click
          style={{ borderRight: '2px solid transparent' }} // Smooth border area
        >
          <Menu.Item
            key="/student"
            icon={<UserAddOutlined />}
            className={`relative transition-all ${selectedKey === '/student' ? 'bg-green-600' : ''}`}
            style={{
              borderLeft: selectedKey === '/student' ? '4px solid #fff' : '4px solid transparent',
              transition: 'border-left 0.3s ease, transform 0.3s ease',
              transform: selectedKey === '/student' ? 'translateX(0)' : 'translateX(-10px)',
            }}
          >
            <Link to="/student">Students</Link>
          </Menu.Item>

          <Menu.Item
            key="/course"
            icon={<BookOutlined />}
            className={`relative transition-all ${selectedKey === '/course' ? 'bg-blue-600' : ''}`}
            style={{
              borderLeft: selectedKey === '/course' ? '4px solid #fff' : '4px solid transparent',
              transition: 'border-left 0.3s ease, transform 0.3s ease',
              transform: selectedKey === '/course' ? 'translateX(0)' : 'translateX(-10px)',
            }}
          >
            <Link to="/course">Courses</Link>
          </Menu.Item>

          <Menu.Item
            key="/result"
            icon={<CheckCircleOutlined />}
            className={`relative transition-all ${selectedKey === '/result' ? 'bg-blue-600' : ''}`}
            style={{
              borderLeft: selectedKey === '/result' ? '4px solid #fff' : '4px solid transparent',
              transition: 'border-left 0.3s ease, transform 0.3s ease',
              transform: selectedKey === '/result' ? 'translateX(0)' : 'translateX(-10px)',
            }}
          >
            <Link to="/result">Results</Link>
          </Menu.Item>

          <Menu.Item
            key="/teacher"
            icon={<TeamOutlined />}
            className={`relative transition-all ${selectedKey === '/teacher' ? 'bg-blue-600' : ''}`}
            style={{
              borderLeft: selectedKey === '/teacher' ? '4px solid #fff' : '4px solid transparent',
              transition: 'border-left 0.3s ease, transform 0.3s ease',
              transform: selectedKey === '/teacher' ? 'translateX(0)' : 'translateX(-10px)',
            }}
          >
            <Link to="/teacher">Teachers</Link>
          </Menu.Item>

          {/* New Notifications Menu Item */}
          <Menu.Item
  key="/notification"
  icon={<NotificationOutlined />}
  className={`relative transition-all ${selectedKey === '/notification' ? 'bg-purple-600' : ''}`}
  style={{
    borderLeft: selectedKey === '/notification' ? '4px solid #fff' : '4px solid transparent',
    transition: 'border-left 0.3s ease, transform 0.3s ease',
    transform: selectedKey === '/notification' ? 'translateX(0)' : 'translateX(-10px)',
  }}
>
  {/* Conditional rendering of the bell icon */}
  {hasPendingApplications && (
    <div className="absolute top-0 right-0 m-[1px] w-5 h-5 rounded-xl bg-red-600 flex justify-center items-center">
    <BellOutlined className="text-white p-1 "/>
    </div>
  )}
  <Link to="/notification">Notifications</Link>
</Menu.Item>
        </Menu>

        {/* Logout Button at the bottom */}
        <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 w-[50%]">
          <Button
            type="default"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            className="w-full bg-red-600 text-white hover:bg-red-700"
          >
            Logout
          </Button>
        </div>
      </Sider>

      {/* Main Content */}
      <Layout>
        <Content className="p-6  bg-gray-100">
          <Routes>
            <Route path="/student" element={<Studentregister />} />
            <Route path="/course" element={<Courses />} />
            <Route path="/result" element={<Results />} />
            <Route path="/teacher" element={<TeachersRig/>} />
            <Route path="/notification" element={<Notifications />} />
            <Route path="/studentrigister" element={<Studentregister />} />
           
            <Route path="/register-form" element={<RegisterForm />} />

          </Routes>
        </Content>
      </Layout>

      {/* Confirmation Modal for Logout */}
      <Modal
        title="Are you sure?"
        visible={isModalVisible}
        onCancel={cancelLogout}
        footer={[
          <Button key="no" onClick={cancelLogout} className="w-24">
            No
          </Button>,
          <Button key="yes" type="primary" onClick={confirmLogout} loading={isLoading} className="w-30">
            {isLoading ? 'Logging out' : 'Yes'}
          </Button>,
        ]}
        style={{
          transition: 'transform 0.3s ease-out',
          transform: isModalVisible ? 'translateY(0)' : 'translateY(100%)',
        }}
      >
        <p>Do you really want to log out?</p>
      </Modal>
    </Layout>
  );
}

export default Home
