interface TimeSlotProps {
  time: string;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export function TimeSlot({ time, selected = false, disabled = false, onClick }: TimeSlotProps) {
  const getStyle = () => {
    const baseStyle = { 
      fontSize: 'var(--text-sm)', 
      fontWeight: 'var(--font-weight-medium)' 
    };

    if (selected) {
      return {
        ...baseStyle,
        background: 'linear-gradient(180deg, #db2321 0%, #a01a18 100%)',
        color: 'white',
        boxShadow: '0 4px 12px rgba(219, 35, 33, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.3), inset 0 -2px 4px rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(160, 26, 24, 0.5)',
        textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
      };
    }

    return {
      ...baseStyle,
      background: 'light-dark(linear-gradient(145deg, rgba(255, 255, 255, 1) 0%, rgba(245, 245, 245, 1) 100%), linear-gradient(145deg, rgba(35, 35, 35, 1) 0%, rgba(25, 25, 25, 1) 100%))',
      color: 'var(--foreground)',
      boxShadow: 'light-dark(inset 1px 1px 3px rgba(0, 0, 0, 0.1), inset -1px -1px 3px rgba(255, 255, 255, 0.9), 0 2px 6px rgba(0, 0, 0, 0.08), inset 1px 1px 3px rgba(0, 0, 0, 0.4), inset -1px -1px 3px rgba(50, 50, 50, 0.5), 0 2px 6px rgba(0, 0, 0, 0.5))',
      border: '1px solid light-dark(rgba(230, 230, 230, 0.8), rgba(50, 50, 50, 0.8))',
    };
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        px-4 py-2.5 rounded-2xl transition-all duration-200 flex items-center justify-center
        ${selected ? 'scale-105' : ''}
        ${disabled 
          ? 'opacity-40 cursor-not-allowed' 
          : 'hover:brightness-105 active:scale-95'
        }
      `}
      style={getStyle()}
    >
      {time}
    </button>
  );
}