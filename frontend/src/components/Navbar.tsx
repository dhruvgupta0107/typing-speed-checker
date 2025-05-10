import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';

export function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="border-b border-gray-200 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-full bg-[#ffa116] flex items-center justify-center">
                                <span className="text-white text-lg font-bold">S</span>
                            </div>
                            <span className="text-xl font-bold text-gray-900">SwiftType</span>
                        </Link>
                    </div>

                    <div className="flex items-center space-x-4">
                        {user ? (
                            <>
                                <Link to="/leaderboard">
                                    <Button variant="ghost" className="text-gray-700 hover:text-[#ffa116]">
                                        Leaderboard
                                    </Button>
                                </Link>
                                <span className="text-gray-700">Welcome, {user.username}</span>
                                <Button
                                    onClick={handleLogout}
                                    variant="outline"
                                    className="text-gray-700 border-gray-300 hover:bg-gray-100"
                                >
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link to="/login">
                                    <Button variant="ghost" className="text-gray-700 hover:text-[#ffa116]">
                                        Login
                                    </Button>
                                </Link>
                                <Link to="/register">
                                    <Button className="bg-[#ffa116] hover:bg-[#ffb84d] text-white">
                                        Sign Up
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
} 