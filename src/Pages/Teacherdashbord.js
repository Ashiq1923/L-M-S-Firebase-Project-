import React, { useState, useEffect } from 'react';
import { Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu, Button, Modal, Spin, Typography } from 'antd';
import { doc, getDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../config/firebase/firebaseconfig';
import StuApplication from '../Dashbord/StudentDashbord/StuApplication';
import TecDashbord from '../Dashbord/TeacherDashbord/TecDashbord';

const { Sider, Content } = Layout;
const { Title } = Typography;

function Teacherdashbord() {
  const [teacherName, setTeacherName] = useState(null);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const uid = user.uid;
        try {
          setLoading(true);
          const teacherDocRef = doc(db, 'teachers', uid);
          const teacherDoc = await getDoc(teacherDocRef);

          if (teacherDoc.exists()) {
            const teacherData = teacherDoc.data();
            setTeacherName(teacherData.name);
          } else {
            console.error('No teacher data found!');
          }
        } catch (error) {
          console.error('Error fetching teacher data:', error);
        } finally {
          setLoading(false); // Stop loading spinner once data fetch is complete
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
    { key: 'application', label: 'Applications', path: 'application' },
  ];

  return (
    <Layout className="h-screen">
      {/* Sidebar */}
      <Sider theme="dark" width={240}>
        <div className="p-4 text-center">
          <div className="w-12 h-12 mx-auto bg-gray-600 rounded-full text-lg font-bold text-white flex items-center justify-center">
            {teacherName ? teacherName.charAt(0).toUpperCase() : <Spin size="small" />}
          </div>
          <h1 className="mt-4 text-white text-lg">
            {loading ? <Spin size="small" /> : teacherName || 'Teacher Name'}
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
            <Route path="/dashboard" element={<TecDashbord />} />
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

export default Teacherdashbord;
