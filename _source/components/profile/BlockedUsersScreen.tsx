import { ArrowLeft, UserX } from 'lucide-react';
import { useState } from 'react';

interface BlockedUser {
  id: string;
  name: string;
  initial: string;
}

interface BlockedUsersScreenProps {
  blockedUsers: BlockedUser[];
  onBack: () => void;
  onUnblock: (userId: string) => void;
}

export function BlockedUsersScreen({
  blockedUsers: initialBlockedUsers,
  onBack,
  onUnblock,
}: BlockedUsersScreenProps) {
  const [blockedUsers, setBlockedUsers] = useState(initialBlockedUsers);

  const handleUnblock = (userId: string) => {
    setBlockedUsers(blockedUsers.filter((u) => u.id !== userId));
    onUnblock(userId);
  };

  return (
    <div className="h-full bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-4 flex items-center flex-shrink-0">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-secondary rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1
          className="flex-1 text-center text-foreground pr-10"
          style={{
            fontSize: 'var(--text-xl)',
            fontWeight: 'var(--font-weight-bold)',
          }}
        >
          Blocked Users
        </h1>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {blockedUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 rounded-full bg-secondary/30 flex items-center justify-center mb-4">
              <UserX size={32} className="text-muted-foreground" />
            </div>
            <h3
              className="text-foreground mb-2 text-center"
              style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-weight-semibold)',
              }}
            >
              No blocked users
            </h3>
            <p
              className="text-muted-foreground text-center max-w-xs"
              style={{
                fontSize: 'var(--text-sm)',
              }}
            >
              Users you block will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {blockedUsers.map((user) => (
              <div
                key={user.id}
                className="bg-card border border-border rounded-xl p-4 flex items-center gap-3"
              >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-primary-dark text-primary-foreground flex items-center justify-center flex-shrink-0">
                  <span style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-semibold)' }}>
                    {user.initial}
                  </span>
                </div>

                {/* Name */}
                <div className="flex-1">
                  <span
                    className="text-foreground"
                    style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
                  >
                    {user.name}
                  </span>
                </div>

                {/* Unblock Button */}
                <button
                  onClick={() => handleUnblock(user.id)}
                  className="text-primary hover:text-primary/80 transition-colors px-3 py-1.5 rounded-lg hover:bg-primary/10"
                  style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
                >
                  Unblock
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}