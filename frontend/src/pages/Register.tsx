import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { useToast } from '../contexts/ToastContext';
import { Navbar } from '../components/Navbar';

export default function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        if (password !== confirmPassword) {
            toast({
                title: 'Error',
                description: 'Passwords do not match',
                type: 'error',
            });
            setIsLoading(false);
            return;
        }

        try {
            await register(username, email, password);
            toast({
                title: 'Success',
                description: 'Account created successfully!',
                type: 'success',
            });
            navigate('/login');
        } catch (error) {
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to create account',
                type: 'error',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-white to-yellow-100 px-4 py-12">
                <div className="w-full max-w-md mx-auto">
                    <Card className="shadow-2xl rounded-2xl border-0">
                        <CardHeader className="flex flex-col items-center gap-2 pb-0">
                            {/* Logo/Icon Placeholder */}
                            <div className="w-14 h-14 rounded-full bg-[#ffa116] flex items-center justify-center mb-2 shadow-md">
                                <span className="text-white text-3xl font-bold">T</span>
                            </div>
                            <CardTitle className="text-2xl font-bold text-gray-900">Create an account</CardTitle>
                            <CardDescription className="text-base text-gray-500">Sign up to start improving your typing speed</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit}>
                            <CardContent className="space-y-5 pt-2">
                                <Input
                                    label="Username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    className="rounded-lg border-gray-300 focus:border-[#ffa116] focus:ring-[#ffa116]/30"
                                />
                                <Input
                                    label="Email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="rounded-lg border-gray-300 focus:border-[#ffa116] focus:ring-[#ffa116]/30"
                                />
                                <Input
                                    label="Password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="rounded-lg border-gray-300 focus:border-[#ffa116] focus:ring-[#ffa116]/30"
                                />
                                <Input
                                    label="Confirm Password"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="rounded-lg border-gray-300 focus:border-[#ffa116] focus:ring-[#ffa116]/30"
                                />
                            </CardContent>
                            <CardFooter className="flex flex-col space-y-4 pt-0">
                                <Button
                                    type="submit"
                                    className="w-full text-base font-semibold py-2 rounded-lg bg-[#ffa116] hover:bg-[#ffb84d] transition-colors duration-200 shadow-md"
                                    isLoading={isLoading}
                                >
                                    Create account
                                </Button>
                                <p className="text-sm text-gray-500 text-center">
                                    Already have an account?{' '}
                                    <Link to="/login" className="text-[#ffa116] hover:text-[#ffb84d] font-medium transition-colors duration-200">
                                        Sign in
                                    </Link>
                                </p>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            </div>
        </>
    );
} 