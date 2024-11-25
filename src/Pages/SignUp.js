// app/components/Signup.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // React Router hook for navigation
import { signup, setDocument } from '../config/Firebase/Firebaseconfiguration'; // Firebase functions import

const Signup = () => {
  const [username, setUsername] = useState(''); // Username state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Hook for navigation

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Firebase signup function call with email converted to lowercase
      const user = await signup(email.toLowerCase(), password);

      // Set expiration time to 2 hours from signup time
      const expirationTime = new Date();
      expirationTime.setHours(expirationTime.getHours() + 2);

      // Firestore mein user ka data save karna using uid
      await setDocument('users', user.uid, {
        username: username, // Adding username to Firestore
        email: user.email,
        createdAt: new Date(),
        newUserExpiresAt: expirationTime, // Add 2-hour expiration time for new user
      });

      // Navigate to login page after successful signup
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" w-[80%] md:w-full max-w-md mx-auto mt-[40%] md:mt-[10%] p-5 border rounded-lg shadow-2xl bg-gray-800 md:bg-white">
      <h2 className="text-white md:text-black text-2xl font-bold text-center mb-4">Signup</h2>
      <form onSubmit={handleSignup}>
        {/* Username Input Field */}
        <input
          type="text"
          placeholder="Enter your username"
          className="w-full p-2 mb-3 border rounded"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        
        {/* Email Input Field */}
        <input
          type="email"
          placeholder="Enter your email"
          className="w-full p-2 mb-3 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* Password Input Field */}
        <input
          type="password"
          placeholder="Enter your password"
          className="w-full p-2 mb-3 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* Display Error Message */}
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        {/* Submit Button */}
        <button
          type="submit"
          className={`w-full p-2 bg-blue-600 text-white rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={loading}
        >
          {loading ? 'Signing Up...' : 'Sign Up'}
        </button>
      </form>

      {/* Already have an account? Link */}
      <p className="text-center mt-4 text-white md:text-black">
        Already have an account?{' '}
        <span
          className="text-blue-500 cursor-pointer hover:underline"
          onClick={() => navigate('/login')}
        >
          Login
        </span>
      </p>
    </div>
  );
};

export default Signup;
