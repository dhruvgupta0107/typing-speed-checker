import React, { createContext, useContext, useState } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: string;
    title: string;
    description: string;
    type: ToastType;
}

interface ToastContextType {
    toast: (props: { title: string; description: string; type: ToastType }) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const toast = ({ title, description, type }: { title: string; description: string; type: ToastType }) => {
        const id = Math.random().toString(36).substring(7);
        const newToast = { id, title, description, type };
        setToasts((prev) => [...prev, newToast]);

        // Remove toast after 3 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    };

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 space-y-4">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className={`toast animate-slide-in ${t.type === 'success'
                                ? 'toast-success'
                                : t.type === 'error'
                                    ? 'toast-error'
                                    : 'toast-info'
                            }`}
                    >
                        <h3 className="font-semibold">{t.title}</h3>
                        <p className="text-sm mt-1">{t.description}</p>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
} 