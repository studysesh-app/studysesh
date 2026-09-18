import { LucideIcon } from 'lucide-react';

interface SkeuomorphicButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  icon?: LucideIcon;
  className?: string;
  fullWidth?: boolean;
}

export function SkeuomorphicButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  icon: Icon,
  className = '',
  fullWidth = false,
}: SkeuomorphicButtonProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-2 gap-1.5';
      case 'lg':
        return 'px-6 py-4 gap-2.5';
      default:
        return 'px-4 py-3 gap-2';
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'sm':
        return 'var(--text-sm)';
      case 'lg':
        return 'var(--text-lg)';
      default:
        return 'var(--text-base)';
    }
  };

  const getVariantStyle = () => {
    if (disabled) {
      return {
        background: 'linear-gradient(145deg, rgba(230, 230, 230, 1) 0%, rgba(210, 210, 210, 1) 100%)',
        boxShadow: 'inset 1px 1px 2px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(200, 200, 200, 0.5)',
        color: 'rgba(150, 150, 150, 0.7)',
      };
    }

    switch (variant) {
      case 'primary':
        return {
          background: 'linear-gradient(180deg, #db2321 0%, #a01a18 100%)',
          boxShadow: '0 4px 12px rgba(219, 35, 33, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.3), inset 0 -2px 4px rgba(0, 0, 0, 0.3)',
          border: '1px solid rgba(160, 26, 24, 0.5)',
          color: 'white',
          textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
        };
      case 'secondary':
        return {
          background: 'linear-gradient(180deg, rgba(255, 255, 255, 1) 0%, rgba(240, 240, 240, 1) 50%, rgba(220, 220, 220, 1) 100%)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1), inset 0 1px 2px rgba(255, 255, 255, 1), inset 0 -2px 4px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(230, 230, 230, 0.8)',
          color: 'var(--foreground)',
        };
      case 'ghost':
        return {
          background: 'linear-gradient(145deg, rgba(250, 250, 250, 1) 0%, rgba(245, 245, 245, 1) 100%)',
          boxShadow: 'inset 1px 1px 2px rgba(0, 0, 0, 0.05), inset -1px -1px 2px rgba(255, 255, 255, 0.9)',
          border: '1px solid rgba(235, 235, 235, 0.5)',
          color: 'var(--foreground)',
        };
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${fullWidth ? 'w-full' : ''}
        ${getSizeClasses()}
        rounded-full transition-all duration-200 flex items-center justify-center
        ${disabled ? 'cursor-not-allowed' : 'hover:brightness-105 active:scale-95'}
        ${className}
      `}
      style={{
        ...getVariantStyle(),
        fontSize: getFontSize(),
        fontWeight: 'var(--font-weight-semibold)',
      }}
    >
      {Icon && <Icon size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />}
      {children}
    </button>
  );
}
