import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'bordered' | 'elevated';
}

export const Card: React.FC<CardProps> = ({
    children,
    variant = 'default',
    className = '',
    ...props
}) => {
    const variants = {
        default: 'bg-white rounded-xl shadow-sm',
        bordered: 'bg-white rounded-xl border border-[#e5e7eb]',
        elevated: 'bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200',
    };

    return (
        <div
            className={`${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> { }

export const CardHeader: React.FC<CardHeaderProps> = ({
    children,
    className = '',
    ...props
}) => {
    return (
        <div
            className={`px-6 py-4 border-b border-[#e5e7eb] ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> { }

export const CardTitle: React.FC<CardTitleProps> = ({
    children,
    className = '',
    ...props
}) => {
    return (
        <h3
            className={`text-lg font-semibold text-[#1a1a1a] ${className}`}
            {...props}
        >
            {children}
        </h3>
    );
};

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> { }

export const CardDescription: React.FC<CardDescriptionProps> = ({
    children,
    className = '',
    ...props
}) => {
    return (
        <p
            className={`text-sm text-[#6b7280] ${className}`}
            {...props}
        >
            {children}
        </p>
    );
};

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> { }

export const CardContent: React.FC<CardContentProps> = ({
    children,
    className = '',
    ...props
}) => {
    return (
        <div
            className={`p-6 ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> { }

export const CardFooter: React.FC<CardFooterProps> = ({
    children,
    className = '',
    ...props
}) => {
    return (
        <div
            className={`px-6 py-4 border-t border-[#e5e7eb] ${className}`}
            {...props}
        >
            {children}
        </div>
    );
}; 