import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { APP_URL } from "../url";
import Navbar from './navbar';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('userInfo');
    if (user) navigate('/')
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setErrors({
      ...errors,
      [e.target.name]: '',
    });
  };

  const isValidEmail = (email) => {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidEmail(formData.email)) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        email: 'Please enter a valid email address.',
      }));
      return;
    }

    if (formData.password.length < 6) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        password: 'Password must be at least 6 characters.',
      }));
      return;
    }

    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };

      const { data, status } = await axios.post(
        `${APP_URL}api/auth/login`,
        {
          "emailId": formData.email,
          "password": formData.password,
        },
        config
      );

      if (status == 200) {
        localStorage.setItem("userInfo", JSON.stringify(data?.User));
        setTimeout(() => { navigate("/") });
      }

    } catch (error) {
      console.log(error.response.data.message)
    }
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible((prevState) => !prevState);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg"
        >
          <h2 className="text-2xl font-bold text-center mb-6">Log In</h2>

          <div className="mb-4">
            <label className="block text-gray-700" htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 mt-2 border border-gray-300 rounded-md"
              required
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700" htmlFor="password">Password</label>
            <div className="relative">
              <input
                type={isPasswordVisible ? 'text' : 'password'}
                id="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-3 mt-2 border border-gray-300 rounded-md"
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
              >
                {isPasswordVisible ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-500 text-white rounded-md"
          >
            Log In
          </button>

          <p className="text-center text-gray-700 mt-4">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="text-blue-500 underline"
            >
              Sign Up
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
