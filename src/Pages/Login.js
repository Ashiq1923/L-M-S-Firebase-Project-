// app/components/Login.js
import React, { useState } from 'react';
import { login, getDocument } from '../config/Firebase/Firebaseconfiguration'; // Import getDocument for Firestore data
import { Link, useNavigate } from 'react-router-dom'; // useNavigate ko import karein

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // useNavigate hook ko initialize karein

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Firebase login function call
      const user = await login(email, password);
      
      // Firestore se user ka username retrieve karna
      const userData = await getDocument('users', user.uid);
      const username = userData.username;

      alert(`Welcome back, ${username}`);

      // Agar login successful hai toh user ko Home page pe redirect karein
      navigate('/home'); // '/home' route par navigate karein
    } catch (err) {
      setError(err.message); // Agar koi error ho toh usko set karein
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="md:w-full  w-[80%] max-w-md mx-auto mt-[40%] md:mt-[10%] p-5 border rounded-lg shadow-2xl bg-gray-800 md:bg-white">
      <h2 className="text-white md:text-black text-2xl font-bold text-center mb-4">Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Enter your email"
          className="w-full p-2  mb-3 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Enter your password"
          className="w-full p-2 mb-3 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          className={`w-full p-2 bg-blue-600 text-white rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>

      <div className="mt-4 text-center">
        <p className='text-white md:text-black'>Don't have an account?</p>
        <Link to="/signup" className="text-blue-500 hover:underline">Sign up here</Link>
      </div>
    </div>
  );
};

export default Login;
