import { ReactNode } from 'react';

interface TwoColumnProps {
  left: ReactNode;
  right: ReactNode;
  className?: string;
  reverseOnMobile?: boolean;
}

export function TwoColumn({
  left,
  right,
  className = '',
  reverseOnMobile = false,
}: TwoColumnProps) {
  const orderClasses = reverseOnMobile
    ? 'flex-col md:flex-row-reverse'
    : 'flex-col md:flex-row';

  return (
    <div className={`flex ${orderClasses} gap-8 ${className}`}>
      <div className="flex-1">{left}</div>
      <div className="flex-1">{right}</div>
    </div>
  );
}