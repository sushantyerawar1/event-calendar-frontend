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
        <nav className="bg-gray-900 text-white py-4 px-6 flex justify-between items-center shadow-md ">
            <img
                src="https://templatic.com/wp/wp-content/uploads/2019/07/what-is-events-calendar-copy.jpg"
                alt="Event Calendar Logo"
                className="h-10 rounded-full"
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
