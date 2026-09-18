import { User, BookOpen, Settings, LogOut, ChevronRight } from 'lucide-react';
import { RoleToggle } from './RoleToggle';

interface StudentProfileScreenProps {
  studentName: string;
  studentInitial: string;
  role: 'student' | 'tutor';
  onRoleChange: (role: 'student' | 'tutor') => void;
  onEditProfile: () => void;
  onMyCourses: () => void;
  onSettings: () => void;
  onLogout: () => void;
}

export function StudentProfileScreen({
  studentName,
  studentInitial,
  role,
  onRoleChange,
  onEditProfile,
  onMyCourses,
  onSettings,
  onLogout,
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
      icon: Settings,
      label: 'Settings',
      onClick: onSettings,
    },
  ];

  return (
    <div className="px-4 pt-6 pb-4">
      {/* Header */}
      <h2 className="mb-6 text-center text-foreground">Profile</h2>

      {/* Profile Card */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6 text-center">
        {/* Avatar */}
        <div className="w-20 h-20 rounded-full bg-primary-dark text-primary-foreground flex items-center justify-center mx-auto mb-3">
          <span style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-weight-semibold)' }}>
            {studentInitial}
          </span>
        </div>

        {/* Name */}
        <h3 className="mb-4 text-foreground">{studentName}</h3>

        {/* Role Toggle */}
        <div className="flex justify-center">
          <RoleToggle role={role} onChange={onRoleChange} />
        </div>
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
        onClick={onLogout}
        className="w-full flex items-center justify-center gap-2 p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-2xl hover:bg-destructive/20 transition-colors"
        style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
      >
        <LogOut className="w-5 h-5" />
        Logout
      </button>
    </div>
  );
}