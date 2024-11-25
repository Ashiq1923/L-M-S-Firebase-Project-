import React, { useEffect, useState } from 'react';
import { Table, Button, notification, Modal, Input, Form } from 'antd';
import { db } from '../../config/firebase/firebaseconfig'; // Your Firebase config
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, deleteUser, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth'; // Authentication
import { EditOutlined, DeleteOutlined } from '@ant-design/icons'; // Import the icons

const AdminData = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    fatherName: '',
    cnic: '',
    phone: '',
  });
  const [editingKey, setEditingKey] = useState(null);
  const [saving, setSaving] = useState(false);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const auth = getAuth();

  // Check if user is authenticated
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        setCurrentUser(user);
      } else {
        setIsAuthenticated(false);
      }
    });
  }, []);

  // Fetch admin data from Firestore
  useEffect(() => {
    const fetchAdminsData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'admin'));
        const adminsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAdmins(adminsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching admins data:', error);
        notification.error({
          message: 'Error',
          description: 'Could not fetch admin data.',
        });
        setLoading(false);
      }
    };
    fetchAdminsData();
  }, []);

  // Open the modal to edit admin data
  const handleEdit = (key) => {
    const admin = admins.find((admin) => admin.id === key);
    setFormData({
      name: admin.name,
      fatherName: admin.fatherName,
      cnic: admin.cnic,
      phone: admin.phone,
    });
    setEditingKey(key);
    setModalVisible(true);
  };

  // Save the edited admin data
  const handleSave = async () => {
    const updatedAdmin = {
      name: formData.name,
      fatherName: formData.fatherName,
      cnic: formData.cnic,
      phone: formData.phone,
    };

    setSaving(true);
    try {
      const adminRef = doc(db, 'admin', editingKey);
      await updateDoc(adminRef, updatedAdmin);

      const updatedAdmins = admins.map((admin) =>
        admin.id === editingKey ? { ...admin, ...updatedAdmin } : admin
      );
      setAdmins(updatedAdmins);
      setModalVisible(false);
      setSaving(false);
      notification.success({
        message: 'Data Saved',
        description: 'Admin data has been updated successfully.',
      });
    } catch (error) {
      setSaving(false);
      console.error('Error saving data:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to save the updated data.',
      });
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setModalVisible(false);
    setEditingKey('');
  };

  // Re-authenticate and delete admin from Firebase Authentication
  const handleDeleteFromAuth = async (user) => {
    const userCredential = EmailAuthProvider.credential(user.email, 'user-password'); // You need to provide password here, or use another method to reauthenticate
    try {
      await reauthenticateWithCredential(user, userCredential);
      await deleteUser(user); // Now that the user is reauthenticated, delete the user
      console.log('User deleted from Firebase Authentication');
    } catch (error) {
      console.error('Error during reauthentication or deletion', error);
      throw new Error('Failed to delete user from Authentication');
    }
  };

  // Delete admin (from Firestore and Firebase Authentication)
  const handleDelete = (key) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this admin?',
      content: 'This action cannot be undone.',
      okText: 'Yes, Delete',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          // Delete from Firestore
          const adminRef = doc(db, 'admin', key); // Ensure the collection name is correct
          await deleteDoc(adminRef); // Delete the admin record from Firestore

          // If the current user is the one being deleted from Firebase Authentication
          const adminToDelete = admins.find(admin => admin.id === key);

          // Reauthenticate and delete from Firebase Authentication
          if (adminToDelete && adminToDelete.email) {
            const userToDelete = auth.currentUser; // The admin's user that should be deleted
            if (userToDelete && userToDelete.email === adminToDelete.email) {
              // If you are deleting the logged-in user, re-authenticate and then delete
              await handleDeleteFromAuth(userToDelete);
            }
          }

          // Update state to reflect deletion in UI
          setAdmins(admins.filter((admin) => admin.id !== key));

          notification.success({
            message: 'Data Deleted',
            description: 'Admin data has been deleted.',
          });
        } catch (error) {
          console.error('Error deleting data:', error);
          notification.error({
            message: 'Error',
            description: 'Failed to delete the admin data.',
          });
        }
      },
    });
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Father Name',
      dataIndex: 'fatherName',
      key: 'fatherName',
    },
    {
      title: 'CNIC',
      dataIndex: 'cnic',
      key: 'cnic',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Password',
      dataIndex: 'password',
      key: 'password',
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt) => new Date(createdAt).toLocaleString(),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => (
        <div>
          <Button
            type="primary"
            style={{ marginRight: 8 }}
            onClick={() => handleEdit(record.id)}
            icon={<EditOutlined />}
          >
            Edit
          </Button>
          <Button
            type="danger"
            onClick={() => handleDelete(record.id)}
            icon={<DeleteOutlined />}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-medium mb-4">Registered Admins</h2>
      <Table
        columns={columns}
        dataSource={admins}
        rowKey="id"
        loading={loading}
        pagination={false}
      />

      {/* Edit Admin Modal */}
      <Modal
        title="Edit Admin"
        visible={modalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button
            key="save"
            type="primary"
            onClick={handleSave}
            loading={saving}
          >
            Save
          </Button>,
        ]}
      >
        <Form
          layout="vertical"
          initialValues={formData}
          onFinish={handleSave}
          validateMessages={{ required: 'This field is required!' }}
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true }]}
          >
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </Form.Item>

          <Form.Item
            label="Father Name"
            name="fatherName"
            rules={[{ required: true }]}
          >
            <Input
              value={formData.fatherName}
              onChange={(e) =>
                setFormData({ ...formData, fatherName: e.target.value })
              }
            />
          </Form.Item>

          <Form.Item
            label="CNIC"
            name="cnic"
            rules={[{ required: true }, { pattern: /^[0-9]{13}$/, message: 'CNIC must be exactly 13 digits' }]}
          >
            <Input
              value={formData.cnic}
              onChange={(e) =>
                setFormData({ ...formData, cnic: e.target.value })
              }
            />
          </Form.Item>

          <Form.Item
            label="Phone"
            name="phone"
            rules={[{ required: true }, { pattern: /^[0-9]{11}$/, message: 'Phone number must be exactly 11 digits' }]}
          >
            <Input
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminData;
