import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { useToast } from '../contexts/ToastContext';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { text, scores } from '../utils/api';

interface TestText {
    text: string;
    source: string;
}

export default function TypingTest() {
    const [testText, setTestText] = useState<TestText>({ text: '', source: '' });
    const [userInput, setUserInput] = useState('');
    const [startTime, setStartTime] = useState<number | null>(null);
    const [isTestActive, setIsTestActive] = useState(false);
    const [wpm, setWpm] = useState(0);
    const [accuracy, setAccuracy] = useState(100);
    const [timeLeft, setTimeLeft] = useState(60);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState('');
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const fetchTestText = useCallback(async () => {
        setIsLoading(true);
        setFetchError('');
        try {
            const response = await text.getText();
            if (response.error) throw new Error(response.error);
            if (!response.data) throw new Error('No data received');
            setTestText(response.data);
        } catch (err) {
            console.error('Error fetching test text:', err);
            setFetchError('Could not load typing text. Please try again.');
            toast({
                title: 'Error',
                description: 'Failed to fetch test text',
                type: 'error',
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchTestText();
    }, [isAuthenticated, navigate, fetchTestText]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isTestActive && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            endTest();
        }
        return () => clearInterval(timer);
    }, [isTestActive, timeLeft]);

    const calculateWPM = (input: string, timeInSeconds: number) => {
        const words = input.trim().split(/\s+/).length;
        const minutes = timeInSeconds / 60;
        return Math.round(words / minutes);
    };

    const calculateAccuracy = (input: string) => {
        const correctChars = input.split('').filter((char, index) => char === testText.text[index]).length;
        return Math.round((correctChars / input.length) * 100) || 100;
    };

    const startTest = () => {
        if (!isAuthenticated) {
            toast({
                title: 'Authentication required',
                description: 'Please log in to start the test',
                type: 'error',
            });
            navigate('/login');
            return;
        }
        setStartTime(Date.now());
        setIsTestActive(true);
        setUserInput('');
        setWpm(0);
        setAccuracy(100);
        setTimeLeft(60);
    };

    const endTest = async () => {
        if (!startTime || !isAuthenticated) return;

        const timeInSeconds = (Date.now() - startTime) / 1000;
        const finalWpm = calculateWPM(userInput, timeInSeconds);
        const finalAccuracy = calculateAccuracy(userInput);

        setWpm(finalWpm);
        setAccuracy(finalAccuracy);
        setIsTestActive(false);

        try {
            const response = await scores.addScore({
                wpm: finalWpm,
                accuracy: finalAccuracy,
                duration: 60,
            });

            if (response.error) throw new Error(response.error);

            toast({
                title: 'Success',
                description: 'Your score has been saved!',
                type: 'success',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to save your score',
                type: 'error',
            });
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isTestActive) return;
        const input = e.target.value;
        setUserInput(input);

        if (startTime) {
            const timeInSeconds = (Date.now() - startTime) / 1000;
            setWpm(calculateWPM(input, timeInSeconds));
            setAccuracy(calculateAccuracy(input));
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape') {
            endTest();
        }
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-white to-yellow-100 px-4 py-12">
                <div className="w-full max-w-2xl mx-auto">
                    <Card className="shadow-2xl rounded-2xl border-0">
                        <CardHeader className="flex flex-col items-center gap-2 pb-0">
                            <CardTitle className="text-2xl font-bold text-gray-900">Typing Speed Test</CardTitle>
                            <CardDescription className="text-base text-gray-500">Test your typing speed and accuracy</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-2">
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div className="flex space-x-4">
                                    <span className="text-lg font-medium">WPM: {wpm}</span>
                                    <span className="text-lg font-medium">Accuracy: {accuracy}%</span>
                                </div>
                                <div className="flex space-x-4 items-center">
                                    <span className="text-lg font-medium">Time: {timeLeft}s</span>
                                    <Button
                                        variant={isTestActive ? 'secondary' : 'primary'}
                                        onClick={isTestActive ? endTest : startTest}
                                        disabled={isLoading || !!fetchError}
                                    >
                                        {isTestActive ? 'End Test' : 'Start Test'}
                                    </Button>
                                </div>
                            </div>
                            <Progress value={(60 - timeLeft) / 60 * 100} variant={isTestActive ? 'default' : 'success'} />
                            {isLoading ? (
                                <div className="flex justify-center items-center py-8">
                                    <span className="text-gray-400">Loading typing text...</span>
                                </div>
                            ) : fetchError ? (
                                <div className="flex flex-col items-center py-8">
                                    <span className="text-red-500 font-medium mb-2">{fetchError}</span>
                                    <Button variant="outline" onClick={fetchTestText}>Retry</Button>
                                </div>
                            ) : (
                                <div className="p-4 bg-gray-50 rounded-lg min-h-[96px]">
                                    <p className="text-lg leading-relaxed break-words">
                                        {testText.text.split('').map((char, index) => {
                                            let className = '';
                                            if (index < userInput.length) {
                                                className = userInput[index] === char ? 'text-green-500' : 'text-red-500';
                                            }
                                            return (
                                                <span key={index} className={className}>
                                                    {char}
                                                </span>
                                            );
                                        })}
                                    </p>
                                </div>
                            )}
                            <input
                                type="text"
                                value={userInput}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                disabled={!isTestActive || isLoading || !!fetchError}
                                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-lg bg-white disabled:bg-gray-100 mt-2"
                                placeholder={isTestActive ? 'Start typing...' : 'Press Start Test to begin'}
                            />
                            <div className="text-sm text-gray-500 flex flex-col gap-1">
                                <p>Source: {testText.source}</p>
                                <p>Press ESC to end the test early</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
} 