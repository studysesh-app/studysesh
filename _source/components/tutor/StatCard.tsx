import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  iconColor?: string;
}

export function StatCard({ icon: Icon, label, value, iconColor = 'text-primary' }: StatCardProps) {
  return (
    <div 
      className="rounded-2xl p-4 flex flex-col items-center gap-2"
      style={{
        background: 'light-dark(linear-gradient(145deg, rgba(255, 255, 255, 1) 0%, rgba(248, 248, 248, 1) 100%), linear-gradient(145deg, rgba(30, 30, 30, 1) 0%, rgba(20, 20, 20, 1) 100%))',
        boxShadow: 'light-dark(0 4px 12px rgba(0, 0, 0, 0.08), inset 1px 1px 2px rgba(255, 255, 255, 0.9), inset -1px -1px 2px rgba(0, 0, 0, 0.05), 0 4px 12px rgba(0, 0, 0, 0.5), inset 1px 1px 2px rgba(50, 50, 50, 0.5), inset -1px -1px 2px rgba(0, 0, 0, 0.3))',
        border: '1px solid light-dark(rgba(230, 230, 230, 0.8), rgba(50, 50, 50, 0.8))',
      }}
    >
      <div 
        className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconColor}`}
        style={{
          background: 'light-dark(linear-gradient(145deg, rgba(250, 250, 250, 1) 0%, rgba(240, 240, 240, 1) 100%), linear-gradient(145deg, rgba(35, 35, 35, 1) 0%, rgba(25, 25, 25, 1) 100%))',
          boxShadow: 'light-dark(inset 1px 1px 2px rgba(0, 0, 0, 0.08), inset -1px -1px 2px rgba(255, 255, 255, 0.9), inset 1px 1px 2px rgba(0, 0, 0, 0.4), inset -1px -1px 2px rgba(50, 50, 50, 0.3))',
        }}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-center">
        <div className="text-foreground" style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--font-weight-bold)' }}>
          {value}
        </div>
        <div
          className="text-muted-foreground"
          style={{ fontSize: 'var(--text-xs)' }}
        >
          {label}
        </div>
      </div>
    </div>
  );
}