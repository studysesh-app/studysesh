import { ArrowLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface SettingsScreenProps {
  email: string;
  isTutor: boolean;
  theme: 'light' | 'dark';
  onBack: () => void;
  onChangePassword: () => void;
  onPrivacyPolicy: () => void;
  onTermsOfService: () => void;
  onThemeChange: (theme: 'light' | 'dark') => void;
}

export function SettingsScreen({
  email,
  isTutor,
  theme,
  onBack,
  onChangePassword,
  onPrivacyPolicy,
  onTermsOfService,
  onThemeChange,
}: SettingsScreenProps) {
  const [bookingNotifs, setBookingNotifs] = useState(true);
  const [messageNotifs, setMessageNotifs] = useState(true);
  const [sessionReminders, setSessionReminders] = useState(true);
  const [autoAccept, setAutoAccept] = useState(false);

  const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean; onChange: (val: boolean) => void }) => (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-primary' : 'bg-secondary'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  return (
    <div className="h-full bg-background flex flex-col p-[0px]">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-4 flex items-center flex-shrink-0">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-secondary rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1
          className="flex-1 text-center text-foreground pr-10"
          style={{
            fontSize: 'var(--text-xl)',
            fontWeight: 'var(--font-weight-bold)',
          }}
        >
          Settings
        </h1>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8">
        {/* Account Section */}
        <section>
          <h3
            className="mb-3 text-muted-foreground uppercase tracking-wide"
            style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-semibold)' }}
          >
            Account Settings
          </h3>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {/* Email */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-1">
                <span
                  className="text-foreground"
                  style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
                >
                  Email
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                  {email}
                </span>
                <button
                  className="text-primary hover:text-primary/80 transition-colors"
                  style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
                  onClick={() => alert('Change email flow')}
                >
                  Change
                </button>
              </div>
            </div>

            {/* Password */}
            <button
              onClick={onChangePassword}
              className="w-full p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors border-b border-border"
            >
              <span
                className="text-foreground"
                style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
              >
                Change Password
              </span>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </section>

        {/* Preferences Section */}
        <section>
          <h3
            className="mb-3 text-muted-foreground uppercase tracking-wide"
            style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-semibold)' }}
          >
            App Preferences
          </h3>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {/* Theme */}
            <div className="p-4 border-b border-border">
              <span
                className="block mb-3 text-foreground"
                style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
              >
                Theme
              </span>
              <div className="flex gap-2">
                {(['light', 'dark'] as const).map((option) => (
                  <button
                    key={option}
                    onClick={() => onThemeChange(option)}
                    className={`flex-1 py-2 px-3 rounded-lg border transition-colors ${
                      theme === option
                        ? 'bg-primary/10 border-primary text-primary'
                        : 'bg-secondary/50 border-border text-foreground hover:bg-secondary'
                    }`}
                    style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Notifications */}
            <div className="p-4 space-y-3">
              <span
                className="block mb-2 text-foreground"
                style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
              >
                Notifications
              </span>
              <div className="flex items-center justify-between">
                <span className="text-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                  Booking notifications
                </span>
                <ToggleSwitch enabled={bookingNotifs} onChange={setBookingNotifs} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                  Message notifications
                </span>
                <ToggleSwitch enabled={messageNotifs} onChange={setMessageNotifs} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                  Session reminders
                </span>
                <ToggleSwitch enabled={sessionReminders} onChange={setSessionReminders} />
              </div>
            </div>
          </div>
        </section>

        {/* Session Preferences (Tutor only) */}
        {isTutor && (
          <section>
            <h3
              className="mb-3 text-muted-foreground uppercase tracking-wide"
              style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-semibold)' }}
            >
              Session Settings
            </h3>
            <div className="bg-card border border-border rounded-2xl overflow-hidden p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span
                    className="block text-foreground"
                    style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
                  >
                    Auto-accept bookings
                  </span>
                  <span className="text-muted-foreground" style={{ fontSize: 'var(--text-xs)' }}>
                    Automatically accept bookings
                  </span>
                </div>
                <ToggleSwitch enabled={autoAccept} onChange={setAutoAccept} />
              </div>
            </div>
          </section>
        )}

        {/* Privacy Section */}
        <section>
          <h3
            className="mb-3 text-muted-foreground uppercase tracking-wide"
            style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-semibold)' }}
          >
            Privacy & Security
          </h3>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {/* Privacy Policy */}
            <button
              onClick={onPrivacyPolicy}
              className="w-full p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors border-b border-border"
            >
              <span
                className="text-foreground"
                style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
              >
                Privacy Policy
              </span>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* Terms of Service */}
            <button
              onClick={onTermsOfService}
              className="w-full p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors border-b border-border"
            >
              <span
                className="text-foreground"
                style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
              >
                Terms of Service
              </span>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            {/* Delete Account */}
            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                  alert('Delete account flow');
                }
              }}
              className="w-full p-4 flex items-center justify-center hover:bg-destructive/10 transition-colors text-destructive"
              style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
            >
              Delete Account
            </button>
          </div>
        </section>

        {/* Support Section */}
        <section>
          <h3
            className="mb-3 text-muted-foreground uppercase tracking-wide"
            style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-semibold)' }}
          >
            Help & Support
          </h3>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <a
              href="mailto:ksmavai2005@gmail.com?subject=Support%20Request"
              className="w-full p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors border-b border-border block"
            >
              <span
                className="text-foreground"
                style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
              >
                Contact Support
              </span>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </a>
            <a
              href="mailto:ksmavai2005@gmail.com?subject=Problem%20Report"
              className="w-full p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors border-b border-border block"
            >
              <span
                className="text-foreground"
                style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
              >
                Report a Problem
              </span>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </a>
            <div className="p-4 text-center">
              <span className="text-muted-foreground" style={{ fontSize: 'var(--text-xs)' }}>
                Version 1.0.0
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}