import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, notification } from 'antd';
import { auth, db, createUserWithEmailAndPassword, setDoc, doc, getDocs, collection } from '../../config/firebase/firebaseconfig';

const { Option } = Select;

const Register = () => {
  const [loading, setLoading] = useState(false); // State to manage loading spinner
  const [courses, setCourses] = useState([]); // State to hold courses list

  // Fetch courses from Firestore
  const fetchCourses = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "courses"));
      const fetchedCourses = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCourses(fetchedCourses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      notification.error({
        message: 'Failed to Load Courses',
        description: error.message,
      });
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleFinish = async (values) => {
    const { email, password, type, course } = values;

    setLoading(true); // Start loading spinner

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid; // Get UID of the new user

      // Save the form data directly in Firestore
      await setDoc(doc(db, type, uid), {
        ...values, // Save all form values
        createdAt: new Date().toISOString(), // Add a timestamp
      });

      // Notify user of success
      notification.success({
        message: 'Registration Successful',
        description: `User registered successfully in ${type} collection!`,
      });

      console.log('Data saved successfully:', values);
    } catch (error) {
      console.error('Error saving data:', error);
      // Notify user of error
      notification.error({
        message: 'Registration Failed',
        description: error.message,
      });
    } finally {
      setLoading(false); // Stop loading spinner
    }
  };

  return (
    <div>
      <h2 className="text-xl font-medium mb-4">Register a New User</h2>
      <Form
        layout="vertical"
        onFinish={handleFinish}
        className="bg-white p-6 shadow-md rounded-md"
      >
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: 'Please enter the name' }]}
        >
          <Input placeholder="Enter name" />
        </Form.Item>
        <Form.Item
          label="Father Name"
          name="fatherName"
          rules={[{ required: true, message: 'Please enter father name' }]}
        >
          <Input placeholder="Enter father name" />
        </Form.Item>
        <Form.Item
          label="CNIC"
          name="cnic"
          rules={[
            { required: true, message: 'Please enter a valid CNIC' },
            { len: 13, message: 'CNIC must be 13 characters' },
          ]}
        >
          <Input placeholder="Enter CNIC (13 digits)" />
        </Form.Item>
        <Form.Item
          label="Phone"
          name="phone"
          rules={[
            { required: true, message: 'Please enter a valid phone number' },
            { len: 11, message: 'Phone number must be 11 digits' },
          ]}
        >
          <Input placeholder="Enter phone number (11 digits)" />
        </Form.Item>
         <Form.Item
          label="Course"
          name="course"
          rules={[{ required: true, message: 'Please select a course' }]}
        >
          <Select placeholder="Select a course">
            {courses.map((course) => (
              <Option key={course.id} value={course.name}>
                {course.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Please enter a valid email' },
            { type: 'email', message: 'Invalid email format' },
          ]}
        >
          <Input placeholder="Enter email" />
        </Form.Item>
        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: 'Please enter a password' }]}
        >
          <Input.Password placeholder="Enter password" />
        </Form.Item>
        <Form.Item
          label="Type"
          name="type"
          rules={[{ required: true, message: 'Please select a type' }]}
        >
          <Select placeholder="Select type">
            <Option value="student">Student</Option>
            <Option value="admin">Admin</Option>
          </Select>
        </Form.Item>
       
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            {loading ? 'Registering...' : 'Register'}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Register;
