import React, { useEffect, useState } from 'react';
import { Button, Table, Modal, Form, Input, InputNumber, message, Spin } from 'antd';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from '../config/firebase/firebaseconfig';

function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [form] = Form.useForm();

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "courses"));
      const fetchedCourses = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCourses(fetchedCourses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      message.error("Failed to fetch courses.");
    }
    setLoading(false);
  };

  const handleRegister = async (values) => {
    setLoading(true);
    try {
      if (isEditing) {
        // Update existing course
        await updateDoc(doc(db, "courses", currentCourse.id), values);
        message.success("Course updated successfully!");
      } else {
        // Add new course
        await addDoc(collection(db, "courses"), values);
        message.success("Course registered successfully!");
      }
      fetchCourses();
      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      console.error("Error saving course:", error);
      message.error("Failed to save course.");
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: "Are you sure you want to delete this course?",
      okText: "Yes",
      cancelText: "No",
      onOk: async () => {
        try {
          setLoading(true);
          await deleteDoc(doc(db, "courses", id));
          message.success("Course deleted successfully!");
          fetchCourses();
        } catch (error) {
          console.error("Error deleting course:", error);
          message.error("Failed to delete course.");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleEdit = (course) => {
    setIsEditing(true);
    setCurrentCourse(course);
    form.setFieldsValue(course);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setIsEditing(false);
    setCurrentCourse(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const columns = [
    {
      title: 'Course Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Nickname',
      dataIndex: 'nickname',
      key: 'nickname',
    },
    {
      title: 'Fee (RS)',
      dataIndex: 'fee',
      key: 'fee',
    },
    {
      title: 'Time Limit (Months)',
      dataIndex: 'timeLimit',
      key: 'timeLimit',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="flex space-x-2">
          <Button
            type="link"
            onClick={() => handleEdit(record)}
            className="text-blue-500 hover:text-blue-700"
          >
            Edit
          </Button>
          <Button
            type="link"
            danger
            onClick={() => handleDelete(record.id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header with Search and Add Course */}
      <div className="flex justify-between items-center mb-4">
        <Input.Search
          placeholder="Search courses"
          allowClear
          className="w-1/2"
          onSearch={(value) => {
            const filtered = courses.filter((course) =>
              course.name.toLowerCase().includes(value.toLowerCase())
            );
            setCourses(filtered);
          }}
        />
        <Button
          type="primary"
          onClick={handleAdd}
          className="bg-blue-500 hover:bg-blue-600"
        >
          Register Course
        </Button>
      </div>

      {/* Courses Table */}
      {loading ? (
        <Spin tip="Loading courses..." />
      ) : (
        <Table
          columns={columns}
          dataSource={courses}
          rowKey="id"
          bordered
          className="bg-white rounded shadow"
        />
      )}

      {/* Modal for Adding/Editing Course */}
      <Modal
        title={isEditing ? "Edit Course" : "Register Course"}
        visible={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleRegister}
        >
          <Form.Item
            label="Course Name"
            name="name"
            rules={[
              { required: true, message: 'Please enter the course name!' },
            ]}
          >
            <Input placeholder="Enter course name" />
          </Form.Item>
          <Form.Item
            label="Nickname"
            name="nickname"
            rules={[
              { required: true, message: 'Please enter the course nickname!' },
            ]}
          >
            <Input placeholder="Enter course nickname" />
          </Form.Item>
          <Form.Item
            label="Fee (RS)"
            name="fee"
            rules={[
              { required: true, message: 'Please enter the course fee!' },
            ]}
          >
            <InputNumber
              placeholder="Enter course fee"
              className="w-full"
            />
          </Form.Item>
          <Form.Item
            label="Time Limit (Months)"
            name="timeLimit"
            rules={[
              { required: true, message: 'Please enter the course time limit!' },
            ]}
          >
            <InputNumber
              placeholder="Enter time limit in months"
              className="w-full"
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {isEditing ? "Save Changes" : "Register Course"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Courses;
