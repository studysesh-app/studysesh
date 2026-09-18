import { useRef, useEffect, useState, ReactNode } from 'react';
import { motion } from 'motion/react';

export interface TabData {
  id: string;
  title: string;
  content: ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  tabs: TabData[];
  activeTabIndex: number;
  onTabChange: (index: number) => void;
  variant?: 'default' | 'pill' | 'underline';
  size?: 'sm' | 'md' | 'lg';
}

export function Tabs({ 
  tabs, 
  activeTabIndex, 
  onTabChange,
  variant = 'default',
  size = 'md' 
}: TabsProps) {
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const activeTab = tabRefs.current[activeTabIndex];
    if (activeTab) {
      setIndicatorStyle({
        left: activeTab.offsetLeft,
        width: activeTab.offsetWidth,
      });
    }
  }, [activeTabIndex, tabs]);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5';
      case 'lg':
        return 'px-6 py-3';
      default:
        return 'px-4 py-2';
    }
  };

  const getVariantClasses = (isActive: boolean, disabled: boolean) => {
    if (disabled) {
      return 'text-muted-foreground/40 cursor-not-allowed';
    }

    switch (variant) {
      case 'pill':
        return isActive
          ? 'text-white'
          : 'text-muted-foreground hover:text-foreground';
      case 'underline':
        return isActive
          ? 'text-primary'
          : 'text-muted-foreground hover:text-foreground';
      default:
        return isActive
          ? 'text-primary'
          : 'text-muted-foreground hover:text-foreground';
    }
  };

  return (
    <div className="w-full">
      {/* Tab Headers */}
      <div 
        className={`relative ${variant === 'pill' ? 'rounded-xl p-1' : 'border-b border-border'}`}
        style={variant === 'pill' ? {
          background: 'light-dark(linear-gradient(145deg, rgba(240, 240, 240, 1) 0%, rgba(220, 220, 220, 1) 100%), linear-gradient(145deg, rgba(40, 40, 40, 1) 0%, rgba(30, 30, 30, 1) 100%))',
          boxShadow: 'light-dark(inset 2px 2px 5px rgba(0, 0, 0, 0.2), inset -2px -2px 5px rgba(255, 255, 255, 0.9), inset 2px 2px 5px rgba(0, 0, 0, 0.5), inset -2px -2px 5px rgba(60, 60, 60, 0.5))',
          border: '1px solid light-dark(rgba(200, 200, 200, 0.5), rgba(60, 60, 60, 0.5))',
        } : undefined}
      >
        <div className={`flex items-center gap-1 relative ${variant === 'pill' ? 'justify-center' : ''}`}
          style={{
            background: 'light-dark(linear-gradient(145deg, rgba(245, 245, 245, 1) 0%, rgba(235, 235, 240, 1) 50%, rgba(245, 245, 245, 1) 100%), linear-gradient(145deg, rgba(40, 40, 42, 1) 0%, rgba(30, 30, 32, 1) 50%, rgba(40, 40, 42, 1) 100%))',
            boxShadow: 'light-dark(inset 1px 1px 2px rgba(255, 255, 255, 0.8), inset -1px -1px 2px rgba(0, 0, 0, 0.1), inset 1px 1px 2px rgba(60, 60, 60, 0.3), inset -1px -1px 2px rgba(0, 0, 0, 0.5))',
            borderRadius: '12px',
            padding: '4px',
          }}
        >
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              ref={(el) => (tabRefs.current[index] = el)}
              onClick={() => !tab.disabled && onTabChange(index)}
              disabled={tab.disabled}
              className={`
                relative z-10 transition-all duration-200 rounded-lg
                ${getSizeClasses()}
                ${getVariantClasses(activeTabIndex === index, !!tab.disabled)}
              `}
              style={{ 
                fontSize: size === 'sm' ? 'var(--text-sm)' : size === 'lg' ? 'var(--text-lg)' : 'var(--text-base)',
                fontWeight: activeTabIndex === index ? 'var(--font-weight-semibold)' : 'var(--font-weight-medium)',
                textShadow: variant === 'pill' && activeTabIndex === index ? '0 1px 2px rgba(0, 0, 0, 0.3)' : 'none',
              }}
            >
              {tab.title}
            </button>
          ))}

          {/* Animated Indicator */}
          {variant === 'underline' && (
            <motion.div
              className="absolute bottom-0 h-0.5 bg-primary rounded-full"
              animate={{
                left: indicatorStyle.left,
                width: indicatorStyle.width,
              }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 20,
              }}
            />
          )}

          {variant === 'default' && (
            <motion.div
              className="absolute bottom-0 h-0.5 bg-primary"
              animate={{
                left: indicatorStyle.left,
                width: indicatorStyle.width,
              }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 20,
              }}
            />
          )}

          {variant === 'pill' && (
            <motion.div
              className="absolute rounded-lg inset-y-1"
              style={{ 
                zIndex: 0,
                background: 'linear-gradient(180deg, #db2321 0%, #a01a18 100%)',
                boxShadow: '0 4px 12px rgba(219, 35, 33, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.3), inset 0 -2px 4px rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(160, 26, 24, 0.5)',
              }}
              animate={{
                left: indicatorStyle.left + 4,
                width: indicatorStyle.width - 8,
              }}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 20,
              }}
            />
          )}
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        <motion.div
          key={activeTabIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {tabs[activeTabIndex]?.content}
        </motion.div>
      </div>
    </div>
  );
}