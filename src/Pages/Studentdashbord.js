import React, { useState, useEffect } from 'react';
import { Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu, Button, Modal, Spin } from 'antd';
import { doc, getDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../config/firebase/firebaseconfig';
import StuDashbord from '../Dashbord/StudentDashbord/StuDashbord';
import StuApplication from '../Dashbord/StudentDashbord/StuApplication';
import StuResult from '../Dashbord/StudentDashbord/StuResult';

const { Sider, Content } = Layout;

function Studentdashbord() {
  const [studentName, setStudentName] = useState(null);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // Use useEffect to monitor auth state changes
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const uid = user.uid;
        try {
          setLoading(true);
          const studentDocRef = doc(db, 'student', uid);
          const studentDoc = await getDoc(studentDocRef);
          if (studentDoc.exists()) {
            const studentData = studentDoc.data();
            setStudentName(studentData.name);
          } else {
            console.error('No student data found!');
          }
        } catch (error) {
          console.error('Error fetching student data:', error);
        } finally {
          setLoading(false);
        }
      } else {
        console.error('No logged-in user found!');
        navigate('/'); // Redirect to login if no user is logged in
      }
    });

    return () => {
      // Cleanup listener when component unmounts
      unsubscribe();
    };
  }, [navigate]);

  const handleLogout = () => {
    const auth = getAuth();
    auth
      .signOut()
      .then(() => {
        setLogoutModalVisible(false);
        navigate('/'); // Redirect to login after logout
      })
      .catch((error) => {
        console.error('Logout error:', error);
      });
  };

  const menuItems = [
    { key: 'dashboard', label: 'Dashboard', path: 'dashboard' },
    { key: 'result', label: 'Result', path: 'result' },
    { key: 'application', label: 'Applications', path: 'application' },
  ];

  return (
    <Layout className="h-screen">
      {/* Sidebar */}
      <Sider theme="dark" width={240}>
        <div className="p-4 text-center">
          <div className="w-12 h-12 mx-auto bg-gray-600 rounded-full text-lg font-bold text-white flex items-center justify-center">
            {studentName ? studentName.charAt(0).toUpperCase() : <Spin size="small" />}
          </div>
          <h1 className="mt-4 text-white text-lg">
            {loading ? <Spin size="small" /> : studentName || 'Student Name'}
          </h1>
        </div>
        <Menu
          theme="dark"
          selectedKeys={[location.pathname.split('/')[1]]}
          mode="inline"
        >
          {menuItems.map((item) => (
            <Menu.Item
              key={item.key}
              className="transition-transform transform  active:scale-95 hover:bg-gray-900"
            >
              <Link to={`${item.path}`}>{item.label}</Link>
            </Menu.Item>
          ))}
        </Menu>
        <div className="p-4">
          <Button
            type="primary"
            danger
            block
            onClick={() => setLogoutModalVisible(true)}
            className="transition-transform transform active:scale-95"
          >
            Logout
          </Button>
        </div>
      </Sider>

      {/* Main Content */}
      <Layout>
       
        <Content className="p-6 bg-gray-100">
          <Routes>
            <Route path="/dashboard" element={<StuDashbord />} />
            <Route path="/result" element={<StuResult />} />
            <Route path="/application" element={<StuApplication />} />
          </Routes>
        </Content>
      </Layout>

      {/* Logout Modal */}
      <Modal
        title="Logout Confirmation"
        visible={logoutModalVisible}
        onOk={handleLogout}
        onCancel={() => setLogoutModalVisible(false)}
        okText="Yes"
        cancelText="No"
        className="transition-transform transform"
        style={{
          transition: 'transform 0.3s ease-out',
          transform: logoutModalVisible ? 'translateY(0)' : 'translateY(100%)',
        }}
      >
        <p>Are you sure you want to logout?</p>
      </Modal>
    </Layout>
  );
}

export default Studentdashbord;
