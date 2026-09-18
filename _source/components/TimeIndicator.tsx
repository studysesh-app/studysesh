import { Clock } from 'lucide-react';

interface TimeIndicatorProps {
  time: string;
  variant?: 'default' | 'compact';
}

export function TimeIndicator({ time, variant = 'default' }: TimeIndicatorProps) {
  return (
    <div className="inline-flex items-center gap-1.5 text-muted-foreground">
      <Clock className={variant === 'compact' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
      <span style={{ 
        fontSize: variant === 'compact' ? 'var(--text-xs)' : 'var(--text-sm)',
        fontWeight: 'var(--font-weight-normal)' 
      }}>
        {time}
      </span>
    </div>
  );
}
