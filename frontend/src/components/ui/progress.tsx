import React from 'react';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
    value: number;
    max?: number;
    showValue?: boolean;
    variant?: 'default' | 'success' | 'error' | 'warning';
}

export const Progress: React.FC<ProgressProps> = ({
    value,
    max = 100,
    showValue = false,
    variant = 'default',
    className = '',
    ...props
}) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    const variants = {
        default: 'bg-[#ffa116]',
        success: 'bg-[#22c55e]',
        error: 'bg-[#ef4444]',
        warning: 'bg-[#f59e0b]',
    };

    return (
        <div className={`w-full ${className}`} {...props}>
            <div className="relative h-2 bg-[#e5e7eb] rounded-full overflow-hidden">
                <div
                    className={`absolute top-0 left-0 h-full transition-all duration-300 ease-out ${variants[variant]}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            {showValue && (
                <div className="mt-1 text-sm text-[#6b7280] text-right">
                    {Math.round(percentage)}%
                </div>
            )}
        </div>
    );
}; 