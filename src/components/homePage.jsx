import React, { useState, useEffect } from 'react';
import Navbar from './navbar';
import { useNavigate } from 'react-router-dom';
import Dashboard from './dashboard';

const HomePage = () => {

  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('userInfo'));
    if (!user) navigate('/login')
    setEmail(user?.emailId);
    setUserName(user?.userName);
  }, []);


  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {email && userName && <Dashboard email={email} userName={userName} />}
    </div>
  );
};

export default HomePage;
