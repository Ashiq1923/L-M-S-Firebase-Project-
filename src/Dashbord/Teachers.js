import React, { useState, useEffect } from "react";
import { db } from "../config/firebase/firebaseconfig"; // Import your Firebase configuration
import { collection, getDocs, setDoc, doc, updateDoc, deleteDoc } from "firebase/firestore"; // Add deleteDoc here
import { Spin, Button, Input, Select, Form, Table, Drawer, notification, Modal } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

const { Option } = Select;

function TeachersRig() {
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    cnic: "",
    email: "",
    password: "",
    phone: "",
    course: "",
    type: "Teacher",
  });
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null); // To track the teacher being edited

  const auth = getAuth();

  // Fetch teachers
  useEffect(() => {
    const fetchTeachers = async () => {
      setLoading(true);
      try {
        const teachersCollection = collection(db, "teachers");
        const snapshot = await getDocs(teachersCollection);
        const teachersList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTeachers(teachersList);
      } catch (error) {
        console.error("Error fetching teachers: ", error);
      }
      setLoading(false);
    };
    fetchTeachers();
  }, []);

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const coursesCollection = collection(db, "courses");
        const snapshot = await getDocs(coursesCollection);
        const coursesList = snapshot.docs.map((doc) => doc.data().name); // Assuming 'name' field in course
        setCourses(coursesList);
      } catch (error) {
        console.error("Error fetching courses: ", error);
      }
      setLoading(false);
    };
    fetchCourses();
  }, []);

  // Handle form input change
  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Include the `type` field explicitly in the data
      const teacherData = {
        ...values,
        type: "Teacher", // Default value for type
      };
  
      if (editingTeacher) {
        // If editing, update the teacher's info
        const teacherRef = doc(db, "teachers", editingTeacher.id);
        await updateDoc(teacherRef, teacherData);
  
        setTeachers((prevTeachers) =>
          prevTeachers.map((teacher) =>
            teacher.id === editingTeacher.id ? { ...teacher, ...teacherData } : teacher
          )
        );
  
        notification.success({
          message: "Teacher Updated",
          description: "Teacher details updated successfully.",
        });
      } else {
        // Create new teacher and add to Firestore
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          values.email,
          values.password
        );
        const user = userCredential.user;
  
        const teacherRef = doc(db, "teachers", user.uid);
        await setDoc(teacherRef, {
          ...teacherData,
          createdAt: new Date(),
        });
  
        setTeachers((prevTeachers) => [
          ...prevTeachers,
          { id: user.uid, ...teacherData },
        ]);
  
        notification.success({
          message: "Teacher Registered",
          description: "Teacher has been registered successfully.",
        });
      }
  
      setFormData({
        name: "",
        cnic: "",
        email: "",
        password: "",
        phone: "",
        course: "",
        type: "Teacher", // Resetting type explicitly
      });
  
      setDrawerVisible(false);
      setEditingTeacher(null);
    } catch (error) {
      console.error("Error adding/updating teacher: ", error);
      notification.error({
        message: "Error",
        description: "There was an error registering/updating the teacher.",
      });
    }
    setLoading(false);
  };
  
  // Table Columns
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Course",
      dataIndex: "course",
      key: "course",
    },
    {
      title: "CNIC", // Add NIC column
      dataIndex: "cnic",
      key: "cnic",
    },
    {
      title: "Phone", // Add Phone column
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div>
          <Button
            icon={<EditOutlined />}
            className="mr-2"
            onClick={() => handleEdit(record)}
          />
          <Button
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            danger
          />
        </div>
      ),
    },
  ];

  // Handle edit teacher
  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name,
      cnic: teacher.cnic,
      email: teacher.email, // Don't allow email to be edited
      password: "", // Password can't be edited
      phone: teacher.phone,
      course: teacher.course,
      type: teacher.type,
    });
    setDrawerVisible(true);
  };

  // Handle delete teacher
  const handleDelete = (id) => {
    // Confirmation modal before deleting
    Modal.confirm({
      title: 'Are you sure you want to delete this teacher?',
      content: 'This action cannot be undone.',
      okText: 'Yes',
      cancelText: 'No',
      onOk: async () => {
        try {
          // Delete teacher from Firestore
          const teacherDoc = doc(db, "teachers", id);
          await deleteDoc(teacherDoc);

          // Remove the teacher from the state immediately (no need to reload)
          setTeachers((prevTeachers) => prevTeachers.filter((teacher) => teacher.id !== id));

          notification.success({
            message: "Teacher Deleted",
            description: "Teacher has been deleted successfully.",
          });
        } catch (error) {
          console.error("Error deleting teacher: ", error);
          notification.error({
            message: "Deletion Failed",
            description: "There was an error deleting the teacher.",
          });
        }
      },
    });
  };

  // Form validation for phone and NIC
  const validatePhone = (_, value) => {
    if (!value || value.length === 11) {
      return Promise.resolve();
    }
    return Promise.reject(new Error("Phone number must be 11 digits"));
  };

  const validateNic = (_, value) => {
    if (!value || value.length === 13) {
      return Promise.resolve();
    }
    return Promise.reject(new Error("CNIC must be 13 digits"));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Teachers</h1>

      <Button
        type="primary"
        onClick={() => setDrawerVisible(true)}
        className="bg-green-500 mb-4"
      >
        Register New Teacher
      </Button>

      {loading && (
        <div className="flex justify-center items-center mb-6">
          <Spin size="large" />
        </div>
      )}

      <Table
        columns={columns}
        dataSource={teachers}
        loading={loading}
        rowKey="id"
        pagination={false}
      />

      <Drawer
        title={editingTeacher ? "Edit Teacher" : "Register Teacher"}
        width={800}
        onClose={() => setDrawerVisible(false)}
        visible={drawerVisible}
        footer={null}
      >
        <Form
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={formData}
          className="space-y-4"
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Name is required" }]}>
            <Input />
          </Form.Item>

          <Form.Item
            label="CNIC"
            name="cnic"
            rules={[{ required: true, message: "CNIC is required" }, { validator: validateNic }]}>
            <Input />
          </Form.Item>

          {!editingTeacher && (
            <>
              <Form.Item
                label="Email"
                name="email"
                rules={[{ required: true, message: "Email is required" }, { type: "email", message: "Invalid email format" }]}>
                <Input />
              </Form.Item>

              <Form.Item
                label="Password"
                name="password"
                rules={[{ required: true, message: "Password is required" }]}>
                <Input.Password />
              </Form.Item>
            </>
          )}

          <Form.Item
            label="Phone"
            name="phone"
            rules={[{ required: true, message: "Phone number is required" }, { validator: validatePhone }]}>
            <Input />
          </Form.Item>

          <Form.Item
            label="Course"
            name="course"
            rules={[{ required: true, message: "Course is required" }]}>
            <Select>
              {courses.map((course, index) => (
                <Option key={index} value={course}>{course}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="bg-blue-500"
              loading={loading}
            >
              {editingTeacher ? "Update" : "Register"}
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}

export default TeachersRig;
