import { ReactNode } from 'react';

interface GridSectionsProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function GridSections({
  children,
  columns = 3,
  gap = 'md',
  className = '',
}: GridSectionsProps) {
  const gridClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
  };

  const classes = `grid ${gridClasses[columns]} ${gapClasses[gap]} ${className}`;

  return <div className={classes}>{children}</div>;
}