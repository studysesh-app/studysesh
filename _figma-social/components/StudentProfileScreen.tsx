import { User, BookOpen, Settings, LogOut, ChevronRight, Bell, Info } from 'lucide-react';
import { RoleToggle } from './RoleToggle';

interface StudentProfileScreenProps {
  name: string;
  pronouns: string;
  year: string;
  program: string;
  bio: string;
  initial: string;
  onEditProfile: () => void;
  onMyCourses: () => void;
  onNotifications: () => void;
  onSettings: () => void;
  onAbout: () => void;
  onSignOut: () => void;
}

export function StudentProfileScreen({
  name,
  pronouns,
  year,
  program,
  bio,
  initial,
  onEditProfile,
  onMyCourses,
  onNotifications,
  onSettings,
  onAbout,
  onSignOut,
}: StudentProfileScreenProps) {
  const menuItems = [
    {
      icon: User,
      label: 'Edit Profile',
      onClick: onEditProfile,
    },
    {
      icon: BookOpen,
      label: 'My Courses',
      onClick: onMyCourses,
    },
    {
      icon: Bell,
      label: 'Notifications',
      onClick: onNotifications,
    },
    {
      icon: Settings,
      label: 'Settings',
      onClick: onSettings,
    },
    {
      icon: Info,
      label: 'About',
      onClick: onAbout,
    },
  ];

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="px-4 pt-6 pb-24">
        {/* Header */}
        <h2 className="mb-6 text-center text-foreground">Profile</h2>

        {/* Profile Card */}
        <div className="bg-card border border-border rounded-2xl p-6 mb-6 text-center">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-3">
            <span style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-weight-semibold)' }}>
              {initial}
            </span>
          </div>

          {/* Name */}
          <h3 className="mb-1 text-foreground">{name}</h3>
          <p className="text-muted-foreground mb-1" style={{ fontSize: 'var(--text-sm)' }}>
            {pronouns}
          </p>
          <p className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
            {year} • {program}
          </p>
        </div>

        {/* Menu Items */}
        <div className="space-y-2 mb-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={item.onClick}
                className="w-full flex items-center gap-3 p-4 bg-card border border-border rounded-2xl hover:bg-secondary transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-secondary/80 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <span
                  className="flex-1 text-left text-foreground"
                  style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
                >
                  {item.label}
                </span>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            );
          })}
        </div>

        {/* Logout Button */}
        <button
          onClick={onSignOut}
          className="w-full flex items-center justify-center gap-2 p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-2xl hover:bg-destructive/20 transition-colors"
          style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );
}