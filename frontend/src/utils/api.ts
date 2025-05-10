import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

interface ApiResponse<T> {
    data?: T;
    error?: string;
}

interface TestTextResponse {
    text: string;
    source: string;
}

interface ScoreResponse {
    id: number;
    wpm: number;
    accuracy: number;
    duration: number;
    user_id: number;
    created_at: string;
}

interface UserResponse {
    id: number;
    username: string;
    email: string;
}

interface AuthResponse {
    token: string;
    user: UserResponse;
}

interface ScoreInput {
    wpm: number;
    accuracy: number;
    duration: number;
}

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to add auth token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const auth = {
    login: async (credentials: { username: string; password: string }): Promise<ApiResponse<AuthResponse>> => {
        try {
            const response = await api.post<AuthResponse>('/auth/login', credentials);
            return { data: response.data };
        } catch (error) {
            return { error: 'Invalid credentials' };
        }
    },

    register: async (userData: { username: string; email: string; password: string }): Promise<ApiResponse<AuthResponse>> => {
        try {
            const response = await api.post<AuthResponse>('/auth/register', userData);
            return { data: response.data };
        } catch (error) {
            return { error: 'Registration failed' };
        }
    },

    me: async (): Promise<ApiResponse<UserResponse>> => {
        try {
            const response = await api.get<UserResponse>('/auth/me');
            return { data: response.data };
        } catch (error) {
            return { error: 'Failed to get user data' };
        }
    },
};

export const scores = {
    addScore: async (scoreData: ScoreInput): Promise<ApiResponse<ScoreResponse>> => {
        try {
            const response = await api.post<ScoreResponse>('/scores', scoreData);
            return { data: response.data };
        } catch (error) {
            return { error: 'Failed to add score' };
        }
    },

    getScores: async (): Promise<ApiResponse<ScoreResponse[]>> => {
        try {
            const response = await api.get<ScoreResponse[]>('/scores');
            return { data: response.data };
        } catch (error) {
            return { error: 'Failed to get scores' };
        }
    },
};

export const text = {
    getRandomText: async (): Promise<ApiResponse<{ text: string }>> => {
        try {
            const response = await api.get<{ text: string }>('/text');
            return { data: response.data };
        } catch (error) {
            return { error: 'Failed to get text' };
        }
    },
}; 