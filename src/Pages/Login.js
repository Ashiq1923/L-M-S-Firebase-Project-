import React, { useState } from 'react';
import { Button, Form, Input, message } from 'antd';
import { signInWithEmailAndPassword } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore"; // Firestore functions
import { auth, db } from '../config/firebase/firebaseconfig'; // Ensure Firestore config is imported
import { useNavigate } from 'react-router-dom';

function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    const { email, password } = values;
    setLoading(true);
    try {
      // Sign in the user
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check user type sequentially
      const studentDoc = await getDoc(doc(db, "student", user.uid));
      if (studentDoc.exists()) {
        const studentData = studentDoc.data();
        const name = studentData.name || "Student"; // Fallback if name doesn't exist
        message.success(`Login successful! Welcome, ${name}!`);
        navigate('/student-dashboard');
        return;
      }

      const teacherDoc = await getDoc(doc(db, "teachers", user.uid));
      if (teacherDoc.exists()) {
        const teacherData = teacherDoc.data();
        const name = teacherData.name || "Teacher"; // Fallback if name doesn't exist
        message.success(`Login successful! Welcome, ${name}!`);
        navigate('/teacher-dashboard');
        return;
      }

      const adminDoc = await getDoc(doc(db, "admin", user.uid));
      if (adminDoc.exists()) {
        const adminData = adminDoc.data();
        const name = adminData.name || "Admin"; // Fallback if name doesn't exist
        message.success(`Login successful! Welcome, ${name}!`);
        navigate('/admin-dashboard');
        return;
      }

      // If no type is found
      throw new Error("User type not found. Please contact support.");
    } catch (error) {
      console.error(error);
      message.error(error.message || "Login failed!");
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    message.error("Please check your input and try again.");
    console.log("Failed:", errorInfo);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Form
        name="login"
        className="w-full max-w-md p-6 bg-white rounded-lg shadow-md"
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      >
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            {
              required: true,
              message: 'Please input your email!',
              type: 'email',
            },
          ]}
        >
          <Input
            placeholder="Enter your email"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[
            {
              required: true,
              message: 'Please input your password!',
            },
          ]}
        >
          <Input.Password
            placeholder="Enter your password"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loading}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition duration-200"
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </Form.Item>

        <p className="text-center text-gray-600 mt-4">
          Not registered? Contact management.
        </p>
      </Form>
    </div>
  );
}

export default Login;
