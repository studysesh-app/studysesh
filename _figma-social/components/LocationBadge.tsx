interface LocationBadgeProps {
  location: string;
}

export function LocationBadge({ location }: LocationBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1.5 rounded-full ${
        location === 'online'
          ? 'bg-yellow-100 text-yellow-800'
          : 'bg-orange-100 text-orange-800'
      }`}
      style={{
        fontSize: 'var(--text-xs)',
        fontWeight: 'var(--font-weight-medium)',
      }}
    >
      {location === 'online' ? 'Online' : 'In-Person'}
    </span>
  );
}