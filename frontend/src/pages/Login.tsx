import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from '../components/Navbar';

export default function Login() {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await login(identifier, password);
            toast({
                title: 'Success',
                description: 'Logged in successfully!',
                type: 'success',
            });
            navigate('/');
        } catch (error) {
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to login',
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
                            <div className="w-14 h-14 rounded-full bg-[#ffa116] flex items-center justify-center mb-2 shadow-md">
                                <span className="text-white text-3xl font-bold">S</span>
                            </div>
                            <CardTitle className="text-2xl font-bold text-gray-900">Welcome Back</CardTitle>
                            <CardDescription className="text-base text-gray-500">
                                Sign in to continue improving your typing speed
                            </CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit}>
                            <CardContent className="space-y-5 pt-2">
                                <Input
                                    label="Username or Email"
                                    type="text"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
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
                            </CardContent>
                            <CardFooter className="flex flex-col space-y-4 pt-0">
                                <Button
                                    type="submit"
                                    className="w-full text-base font-semibold py-2 rounded-lg bg-[#ffa116] hover:bg-[#ffb84d] transition-colors duration-200 shadow-md"
                                    isLoading={isLoading}
                                >
                                    Sign in
                                </Button>
                                <p className="text-sm text-gray-500 text-center">
                                    Don't have an account?{' '}
                                    <Link to="/register" className="text-[#ffa116] hover:text-[#ffb84d] font-medium transition-colors duration-200">
                                        Sign up
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