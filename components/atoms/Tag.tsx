import { ReactNode } from 'react';

interface TagProps {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'secondary';
  size?: 'sm' | 'md';
  className?: string;
  onRemove?: () => void;
}

export function Tag({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  onRemove,
}: TagProps) {
  const baseClasses = 'inline-flex items-center font-medium rounded-md';

  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-blue-100 text-blue-800',
    secondary: 'bg-green-100 text-green-800',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <span className={classes}>
      {children}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
          aria-label="Remove tag"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
}