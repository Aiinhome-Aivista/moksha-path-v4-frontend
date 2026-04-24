import React from 'react';

type LoaderSize = 'sm' | 'md' | 'lg' | 'xl';

interface LoaderProps {
    size?: LoaderSize;
    className?: string;
    text?: string;
}

const sizeStyles: Record<LoaderSize, string> = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
};

export const Loader: React.FC<LoaderProps> = ({
    size = 'md',
    className = '',
    text,
}) => {
    return (
        <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
            <div className="relative">
                <div
                    className={`${sizeStyles[size]} animate-spin rounded-full border-4 border-secondary-200 border-t-primary-600 dark:border-secondary-700 dark:border-t-primary-400`}
                />
            </div>
            {text && (
                <p className="text-sm text-secondary-600 dark:text-secondary-400 animate-pulse">
                    {text}
                </p>
            )}
        </div>
    );
};

// Full page loader component
export const PageLoader: React.FC<{ text?: string }> = ({ text = 'Loading...' }) => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
            <Loader size="xl" text={text} />
        </div>
    );
};

export default Loader;
