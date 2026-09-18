import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

interface SignInScreenProps {
  onBack: () => void;
  onSignIn: (email: string, password: string) => void;
  onSignUpLink: () => void;
}

export function SignInScreen({ onBack, onSignIn, onSignUpLink }: SignInScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = () => {
    // Auto-accept logic - no validation for prototype
    onSignIn(email || 'demo@carleton.ca', password || 'password123');
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
          Sign In
        </h1>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center px-6 py-8">
        <div className="max-w-sm mx-auto w-full">
          <h2 className="text-foreground mb-2 text-center" style={{ fontSize: '1.75rem', fontWeight: 'var(--font-weight-bold)' }}>
            Welcome Back
          </h2>
          <p className="text-muted-foreground mb-8 text-center" style={{ fontSize: 'var(--text-base)' }}>
            Sign in to continue learning
          </p>

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
          <div className="mb-2">
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

          {/* Forgot Password Link */}
          <div className="mb-6 text-right">
            <button className="text-primary hover:text-primary/80 transition-colors" style={{ fontSize: 'var(--text-sm)' }}>
              Forgot password?
            </button>
          </div>

          {/* Sign In Button */}
          <button
            onClick={handleSignIn}
            className="w-full py-4 bg-primary text-white rounded-full hover:bg-primary/90 transition-all mb-4"
            style={{ 
              fontSize: 'var(--text-base)', 
              fontWeight: 'var(--font-weight-semibold)',
              boxShadow: '0 6px 12px rgba(219, 35, 33, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.2)',
            }}
          >
            Sign In
          </button>

          {/* Sign Up Link */}
          <div className="text-center">
            <button
              onClick={onSignUpLink}
              className="text-muted-foreground hover:text-foreground transition-colors"
              style={{ fontSize: 'var(--text-sm)' }}
            >
              Don't have an account?{' '}
              <span className="text-primary" style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                Sign Up
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}