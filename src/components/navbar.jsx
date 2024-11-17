import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();
    const [isLoggiedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const user = localStorage.getItem('userInfo');
        if (user) setIsLoggedIn(true);
    }, [])

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        setIsLoggedIn(false);
        navigate('/login');
    };

    return (
        <nav className="bg-gray-900 text-white py-4 px-6 flex justify-between items-center shadow-md">
            <img
                src="https://cdn.prod.website-files.com/670a59845f0989763e175200/670a59845f0989763e1759f7_Shvasa%20Logo.png"
                alt="Shvasa Logo"
                className="h-10"
            />
            {
                isLoggiedIn ? (
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                        Logout
                    </button>
                )
                    : null
            }
        </nav>
    );
};

export default Navbar;
