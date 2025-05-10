import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useToast } from '../contexts/ToastContext';
import { Navbar } from '../components/Navbar';
import { scores } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const SAMPLE_TEXT = "The quick brown fox jumps over the lazy dog. Programming is the process of creating a set of instructions that tell a computer how to perform a task. Programming can be done using a variety of computer programming languages, such as JavaScript, Python, and C++. The best way to learn programming is to practice writing code and building projects.";

export default function Home() {
    const [text, setText] = useState('');
    const [input, setInput] = useState('');
    const [startTime, setStartTime] = useState<number | null>(null);
    const [endTime, setEndTime] = useState<number | null>(null);
    const [isTyping, setIsTyping] = useState(false);
    const [wpm, setWpm] = useState(0);
    const [accuracy, setAccuracy] = useState(0);
    const [duration, setDuration] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60); // 60 seconds timer
    const [isTestActive, setIsTestActive] = useState(false);
    const { toast } = useToast();
    const { user } = useAuth();

    const fetchText = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/text');
            const data = await response.json();
            setText(data.text);
        } catch (error) {
            console.error('Error fetching text:', error);
        }
    };

    useEffect(() => {
        fetchText();
    }, []);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isTestActive && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        setIsTestActive(false);
                        setEndTime(Date.now());
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isTestActive, timeLeft]);

    const calculateWPM = useCallback((timeInSeconds: number) => {
        const words = input.trim().split(/\s+/).length;
        const minutes = timeInSeconds / 60;
        return Math.round(words / minutes);
    }, [input]);

    const calculateAccuracy = useCallback(() => {
        let correct = 0;
        const minLength = Math.min(input.length, text.length);

        for (let i = 0; i < minLength; i++) {
            if (input[i] === text[i]) {
                correct++;
            }
        }

        return Math.round((correct / text.length) * 100);
    }, [input, text]);

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setInput(value);

        if (!isTyping && !isTestActive) {
            setIsTyping(true);
            setIsTestActive(true);
            setStartTime(Date.now());
        }

        // Auto-scroll the text container
        const textContainer = document.querySelector('.overflow-y-auto');
        if (textContainer) {
            const lineHeight = 24; // Approximate line height in pixels
            const currentLine = Math.floor(value.split('\n').length);
            textContainer.scrollTop = (currentLine - 1) * lineHeight;
        }
    };

    const handleStartTest = () => {
        setIsTestActive(true);
        setStartTime(Date.now());
        setInput('');
    };

    const handleRestart = () => {
        setInput('');
        setStartTime(null);
        setEndTime(null);
        setWpm(0);
        setAccuracy(0);
        setTimeLeft(60);
        setIsTestActive(false);
        fetchText(); // Fetch new random text when restarting
    };

    const handleEndTest = () => {
        setIsTestActive(false);
        setEndTime(Date.now());
    };

    const handleSubmit = async () => {
        if (!endTime || !startTime) return;

        const timeInSeconds = (endTime - startTime) / 1000;
        const calculatedWpm = calculateWPM(timeInSeconds);
        const calculatedAccuracy = calculateAccuracy();

        setWpm(calculatedWpm);
        setAccuracy(calculatedAccuracy);

        try {
            const response = await scores.addScore({
                wpm: calculatedWpm,
                accuracy: calculatedAccuracy,
                duration: Math.round(timeInSeconds)
            });

            if (response.error) {
                throw new Error(response.error);
            }

            toast({
                title: 'Success',
                description: 'Score submitted successfully!',
                type: 'success',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: error instanceof Error ? error.message : 'Failed to submit score',
                type: 'error',
            });
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const renderText = () => {
        const lines = text.split('\n');
        const visibleLines = lines;
        const inputLines = input.split('\n');
        const currentLine = Math.floor(inputLines.length - 1);

        return (
            <div className="relative">
                <div className="min-h-[120px] max-h-[400px] overflow-y-auto bg-white border border-gray-200 rounded-lg p-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-200 [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-gray-500">
                    {visibleLines.map((line, lineIndex) => (
                        <div key={lineIndex} className="mb-1">
                            {line.split('').map((char, charIndex) => {
                                let color = 'text-gray-600';
                                const currentInputLine = inputLines[lineIndex] || '';

                                if (lineIndex < currentLine) {
                                    // Previous lines are green only if they match exactly
                                    const completedLine = inputLines[lineIndex];
                                    if (completedLine && completedLine === line) {
                                        color = 'text-green-600';
                                    }
                                } else if (lineIndex === currentLine) {
                                    // Current line: check each character
                                    if (charIndex < currentInputLine.length) {
                                        color = currentInputLine[charIndex] === char ? 'text-green-600' : 'text-red-600';
                                    }
                                }

                                return (
                                    <span key={charIndex} className={color}>
                                        {char}
                                    </span>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <>
            <Navbar />
            <div className="bg-white px-4 py-6">
                <div className="max-w-4xl mx-auto">
                    <Card className="shadow-2xl rounded-2xl border-0 bg-white flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold text-gray-900">SwiftType Test</CardTitle>
                            <CardDescription className="text-gray-500">
                                Type the text below as quickly and accurately as possible
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col space-y-4 overflow-hidden">
                            <div className="flex justify-between items-center">
                                <div className="text-lg font-medium text-gray-700">
                                    Time Left: <span className="font-bold">{formatTime(timeLeft)}</span>
                                </div>
                                <div className="space-x-4">
                                    {!isTestActive && !endTime && (
                                        <Button
                                            onClick={handleStartTest}
                                            className="bg-[#ffa116] hover:bg-[#ffb84d] text-white"
                                        >
                                            Start Test
                                        </Button>
                                    )}
                                    {isTestActive && (
                                        <Button
                                            onClick={handleEndTest}
                                            variant="outline"
                                            className="text-gray-700 border-gray-300 hover:bg-gray-100"
                                        >
                                            End Test
                                        </Button>
                                    )}
                                </div>
                            </div>
                            <div className="mb-4">
                                {renderText()}
                            </div>
                            <div>
                                <textarea
                                    value={input}
                                    onChange={handleInputChange}
                                    placeholder="Start typing here..."
                                    className="w-full min-h-[120px] max-h-[400px] p-4 rounded-lg border border-gray-200 bg-white text-gray-900 focus:border-[#ffa116] focus:ring-[#ffa116]/30 resize-none"
                                    disabled={!isTestActive}
                                />
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="space-x-4">
                                    <Button
                                        onClick={handleRestart}
                                        variant="outline"
                                        className="text-gray-700 border-gray-300 hover:bg-gray-100"
                                    >
                                        Restart
                                    </Button>
                                    {endTime && (
                                        <Button
                                            onClick={handleSubmit}
                                            className="bg-[#ffa116] hover:bg-[#ffb84d] text-white"
                                        >
                                            Submit Score
                                        </Button>
                                    )}
                                </div>
                                {endTime && (
                                    <div className="text-right">
                                        <p className="text-gray-700">
                                            WPM: <span className="font-bold">{wpm}</span>
                                        </p>
                                        <p className="text-gray-700">
                                            Accuracy: <span className="font-bold">{accuracy}%</span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
} 