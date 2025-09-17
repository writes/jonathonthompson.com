import { ReactNode } from 'react';
import Image from 'next/image';

interface CardProps {
  children: ReactNode;
  title?: string;
  image?: string;
  imageAlt?: string;
  className?: string;
  onClick?: () => void;
}

export function Card({
  children,
  title,
  image,
  imageAlt,
  className = '',
  onClick,
}: CardProps) {
  const cardClasses = `bg-white rounded-lg shadow-md overflow-hidden transition-shadow hover:shadow-lg ${onClick ? 'cursor-pointer' : ''} ${className}`;

  return (
    <div className={cardClasses} onClick={onClick}>
      {image && (
        <div className="relative w-full h-48">
          <Image
            src={image}
            alt={imageAlt || title || 'Card image'}
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className="p-6">
        {title && <h3 className="text-xl font-semibold mb-2">{title}</h3>}
        {children}
      </div>
    </div>
  );
}