interface PricingBubbleProps {
  type: 'group' | 'individual';
  price: string;
  size?: 'sm' | 'md';
}

export function PricingBubble({ type, price, size = 'md' }: PricingBubbleProps) {
  const isGroup = type === 'group';
  
  const getStyles = () => {
    if (isGroup) {
      return {
        backgroundColor: 'light-dark(#d5e2f6, rgba(30,58,138,0.3))',
        color: 'light-dark(#2563eb, #60a5fa)',
      };
    }
    return {
      backgroundColor: 'light-dark(#c8e6c9, rgba(22,101,52,0.3))',
      color: 'light-dark(#2e7d32, #86efac)',
    };
  };
  
  return (
    <span
      className={`inline-flex items-center rounded-full ${
        size === 'sm' ? 'px-2.5 py-1' : 'px-3 py-1.5'
      }`}
      style={{
        ...getStyles(),
        fontSize: size === 'sm' ? 'var(--text-xs)' : 'var(--text-sm)',
        fontWeight: 'var(--font-weight-semibold)',
      }}
    >
      {price.toLowerCase() === 'free' ? 'Free' : `$${price}`}
      {size !== 'sm' && (
        <span className="ml-1" style={{ fontWeight: 'var(--font-weight-normal)', opacity: 0.7 }}>
          / {type === 'group' ? 'group' : '1:1'}
        </span>
      )}
    </span>
  );
}