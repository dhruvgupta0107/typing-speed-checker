import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/table';
import { useToast } from '../contexts/ToastContext';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { scores } from '../utils/api';

interface Score {
    id: number;
    wpm: number;
    accuracy: number;
    duration: number;
    timestamp: string;
    username: string;
}

export default function Leaderboard() {
    const [scoresList, setScoresList] = useState<Score[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        const fetchScores = async () => {
            try {
                const response = await scores.getScores();
                if (response.error) throw new Error(response.error);
                if (response.data) {
                    // Get best score per user
                    const bestScores = response.data.reduce((acc: { [key: string]: Score }, score: Score) => {
                        if (!acc[score.username] || acc[score.username].wpm < score.wpm) {
                            acc[score.username] = score;
                        }
                        return acc;
                    }, {});

                    // Convert to array and sort by WPM
                    const sortedScores = Object.values(bestScores).sort((a, b) => b.wpm - a.wpm);
                    setScoresList(sortedScores);
                }
            } catch (error) {
                toast({
                    title: 'Error',
                    description: 'Failed to fetch leaderboard data',
                    type: 'error',
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchScores();
    }, [toast, isAuthenticated, navigate]);

    const formatDateTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            timeZone: 'Asia/Kolkata'
        }).format(date);
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-white px-4 py-12">
                <div className="max-w-4xl mx-auto">
                    <Card className="shadow-2xl rounded-2xl border-0 bg-white">
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold text-gray-900">SwiftType Leaderboard</CardTitle>
                            <CardDescription className="text-gray-500">
                                Top typing speeds from our community
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table variant="striped">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-gray-700">Rank</TableHead>
                                        <TableHead className="text-gray-700">Username</TableHead>
                                        <TableHead className="text-gray-700">WPM</TableHead>
                                        <TableHead className="text-gray-700">Accuracy</TableHead>
                                        <TableHead className="text-gray-700">Duration</TableHead>
                                        <TableHead className="text-gray-700">Date & Time</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {scoresList.map((score, index) => (
                                        <TableRow
                                            key={score.id}
                                            className={`${index < 3 ? 'bg-yellow-50' : ''} hover:bg-gray-50 transition-colors`}
                                        >
                                            <TableCell className="font-medium text-gray-900">
                                                {index + 1}
                                            </TableCell>
                                            <TableCell className="font-medium text-gray-900">
                                                {score.username}
                                            </TableCell>
                                            <TableCell className="font-bold text-[#ffa116]">
                                                {score.wpm}
                                            </TableCell>
                                            <TableCell className="text-gray-700">
                                                {score.accuracy}%
                                            </TableCell>
                                            <TableCell className="text-gray-700">
                                                {score.duration}s
                                            </TableCell>
                                            <TableCell className="text-gray-700">
                                                {formatDateTime(score.timestamp)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {scoresList.length === 0 && !isLoading && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                                No scores available yet
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {isLoading && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                                Loading...
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
} 