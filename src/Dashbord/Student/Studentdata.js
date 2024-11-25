import React, { useEffect, useState } from 'react';
import { Table, Button, notification, Input, Modal, Form } from 'antd';
import { db } from '../../config/firebase/firebaseconfig'; // Your Firebase config
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons'; // Import icons

const StudentsData = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingKey, setEditingKey] = useState(''); // Key of the student being edited
  const [modalVisible, setModalVisible] = useState(false); // Control modal visibility
  const [saving, setSaving] = useState(false); // To show loading spinner on Save

  // The form data that will be passed to the modal
  const [formData, setFormData] = useState({
    name: '',
    fatherName: '',
    cnic: '',
    phone: '',
  });

  // Fetch students data from Firestore
  useEffect(() => {
    const fetchStudentsData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'student'));
        const studentsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setStudents(studentsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching students data:', error);
        notification.error({
          message: 'Error',
          description: 'Could not fetch student data.',
        });
        setLoading(false);
      }
    };

    fetchStudentsData();
  }, []);

  // Open the modal to edit the data
  const handleEdit = (key) => {
    const student = students.find((student) => student.id === key);
    setFormData({
      name: student.name,
      fatherName: student.fatherName,
      cnic: student.cnic,
      phone: student.phone,
    });
    setEditingKey(key);
    setModalVisible(true);
  };

  // Save the edited data
  const handleSave = async () => {
    const studentId = editingKey;
    const updatedStudent = {
      name: formData.name,
      fatherName: formData.fatherName,
      cnic: formData.cnic,
      phone: formData.phone,
    };

    setSaving(true);
    try {
      const studentRef = doc(db, 'student', studentId);
      await updateDoc(studentRef, updatedStudent);

      // Update local state
      const updatedStudents = students.map((student) =>
        student.id === studentId ? { ...student, ...updatedStudent } : student
      );
      setStudents(updatedStudents);
      setModalVisible(false);
      setSaving(false);
      notification.success({
        message: 'Data Saved',
        description: 'Student data has been updated successfully.',
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

  // Handle cancel and close modal without saving
  const handleCancel = () => {
    setModalVisible(false);
    setEditingKey('');
  };

  // Delete function with confirmation
  const handleDelete = (key) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this student?',
      content: 'This action cannot be undone.',
      okText: 'Yes, Delete',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          // Use deleteDoc to delete the student record from Firestore
          const studentRef = doc(db, 'student', key);
          await deleteDoc(studentRef); // This will delete the student document from Firestore

          // Update local state by removing the deleted student from the list
          setStudents(students.filter((student) => student.id !== key));
          notification.success({
            message: 'Data Deleted',
            description: 'Student data has been deleted.',
          });
        } catch (error) {
          console.error('Error deleting data:', error);
          notification.error({
            message: 'Error',
            description: 'Failed to delete the student data.',
          });
        }
      },
    });
  };

  // Columns definition for the table
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
      title: 'Course',
      dataIndex: 'course',
      key: 'course',
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
      render: (_, record) => (
        <div>
          <Button
            onClick={() => handleEdit(record.id)}
            type="primary"
            icon={<EditOutlined />} // Add the Edit icon
            className='ml-[9px]'
          >
            Edit
          </Button>
          <Button
            type="danger"
            onClick={() => handleDelete(record.id)}
            icon={<DeleteOutlined />} // Add the Delete icon
            className='mt-[10px]'
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-medium mb-4">Registered Students</h2>
      <Table
        columns={columns}
        dataSource={students}
        rowKey="id"
        loading={loading}
        pagination={false}
      />

      {/* Edit Modal */}
      <Modal
        title="Edit Student"
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

export default StudentsData;
