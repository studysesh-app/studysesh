import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface SignUpScreenProps {
  role: 'student' | 'tutor';
  onBack: () => void;
  onSignUp: (email: string, password: string) => void;
  onSignInLink: () => void;
}

export function SignUpScreen({ role, onBack, onSignUp, onSignInLink }: SignUpScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignUp = () => {
    // Auto-accept logic - no validation for prototype
    onSignUp(email || 'demo@carleton.ca', password || 'password123');
  };

  return (
    <div className="h-full bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-4 flex items-center flex-shrink-0">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-secondary rounded-lg transition-colors text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1
          className="flex-1 text-center text-foreground pr-10"
          style={{
            fontSize: 'var(--text-xl)',
            fontWeight: 'var(--font-weight-bold)',
          }}
        >
          Sign Up
        </h1>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-sm mx-auto">
          {/* Role Badge */}
          <div className="mb-6 text-center">
            <div className="inline-block px-4 py-2 bg-primary/10 rounded-full">
              <span className="text-primary" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}>
                {role === 'student' ? 'Student Account' : 'Tutor Account'}
              </span>
            </div>
          </div>

          {/* Email Field */}
          <div className="mb-4">
            <label
              className="block mb-2 text-foreground"
              style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
            >
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@carleton.ca"
                className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                style={{ fontSize: 'var(--text-base)' }}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="mb-4">
            <label
              className="block mb-2 text-foreground"
              style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
            >
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-12 pr-12 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                style={{ fontSize: 'var(--text-base)' }}
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="mb-6">
            <label
              className="block mb-2 text-foreground"
              style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
            >
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="w-full pl-12 pr-12 py-3 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                style={{ fontSize: 'var(--text-base)' }}
              />
              <button
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Sign Up Button */}
          <button
            onClick={handleSignUp}
            className="w-full py-4 bg-primary text-white rounded-full hover:bg-primary/90 transition-all mb-4"
            style={{ 
              fontSize: 'var(--text-base)', 
              fontWeight: 'var(--font-weight-semibold)',
              boxShadow: '0 6px 12px rgba(219, 35, 33, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.2)',
            }}
          >
            Create Account
          </button>

          {/* Sign In Link */}
          <div className="text-center">
            <button
              onClick={onSignInLink}
              className="text-muted-foreground hover:text-foreground transition-colors"
              style={{ fontSize: 'var(--text-sm)' }}
            >
              Already have an account?{' '}
              <span className="text-primary" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                Sign In
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}