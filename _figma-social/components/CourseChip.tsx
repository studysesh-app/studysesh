interface CourseChipProps {
  code: string;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'default' | 'large' | 'small';
}

export function CourseChip({ code, selected = false, onClick, disabled = false, variant = 'default' }: CourseChipProps) {
  const baseClasses = `
    inline-flex items-center justify-center rounded-full
    transition-all duration-200 whitespace-nowrap
    ${variant === 'large' ? 'px-5 py-2.5' : variant === 'small' ? 'px-2 py-1' : 'px-3 py-1.5'}
    ${disabled 
      ? 'opacity-50 cursor-not-allowed' 
      : onClick ? 'hover:brightness-105 active:scale-95 cursor-pointer' : ''
    }
  `;

  const getStyle = () => {
    const baseStyle = { 
      fontSize: variant === 'large' ? 'var(--text-base)' : variant === 'small' ? 'var(--text-xs)' : 'var(--text-sm)', 
      fontWeight: 'var(--font-weight-medium)' 
    };

    if (selected) {
      return {
        ...baseStyle,
        background: 'linear-gradient(180deg, #db2321 0%, #a01a18 100%)',
        color: 'white',
        boxShadow: '0 4px 12px rgba(219, 35, 33, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.3), inset 0 -2px 4px rgba(0, 0, 0, 0.3)',
        textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
      };
    }

    return baseStyle;
  };

  const backgroundClass = selected ? '' : 'bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800';

  // If onClick is provided, render as a button
  if (onClick) {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`${baseClasses} ${backgroundClass}`}
        style={getStyle()}
      >
        {code}
      </button>
    );
  }

  // Otherwise, render as a span (for display-only cases)
  return (
    <span
      className={`${baseClasses} ${backgroundClass}`}
      style={getStyle()}
    >
      {code}
    </span>
  );
}