import { useState } from 'react';
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { SkeuomorphicButton } from '../SkeuomorphicButton';

interface EmailVerificationScreenProps {
  onBack: () => void;
  onVerify: (email: string) => void;
  onSendCode: (email: string) => void;
}

export function EmailVerificationScreen({
  onBack,
  onVerify,
  onSendCode,
}: EmailVerificationScreenProps) {
  const [email, setEmail] = useState('alex.johnson@cmail.carleton.ca');
  const [verificationCode, setVerificationCode] = useState('123456');
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState('');

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate Carleton email
    if (!email.endsWith('@cmail.carleton.ca')) {
      setError('Carleton University students only. Please use your @cmail.carleton.ca email.');
      return;
    }
    
    setError('');
    onSendCode(email);
    setCodeSent(true);
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (verificationCode.length !== 6) {
      setError('Please enter the 6-digit code sent to your email.');
      return;
    }
    
    setError('');
    onVerify(email);
  };

  return (
    <div className="h-full bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 pt-12 pb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-muted rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1>Verify Your Email</h1>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full">
          {/* Icon */}
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Mail className="w-10 h-10 text-primary" />
          </div>

          {!codeSent ? (
            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <p className="text-center text-muted-foreground mb-6">
                  Enter your Carleton University email address to get started.
                </p>
                
                <label className="block mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@cmail.carleton.ca"
                  className="w-full px-4 py-3 rounded-xl bg-input-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  required
                />
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                  <p className="text-destructive" style={{ fontSize: 'var(--text-sm)' }}>
                    {error}
                  </p>
                </div>
              )}

              <SkeuomorphicButton
                type="submit"
                variant="primary"
                fullWidth
              >
                Send Verification Code
              </SkeuomorphicButton>
            </form>
          ) : (
            <form onSubmit={handleCodeSubmit} className="space-y-6">
              <div>
                <p className="text-center text-muted-foreground mb-6">
                  We sent a 6-digit code to <span className="text-foreground font-medium">{email}</span>
                </p>
                
                <label className="block mb-2">Verification Code</label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full px-4 py-3 rounded-xl bg-input-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-center tracking-widest"
                  style={{ fontSize: 'var(--text-2xl)' }}
                  maxLength={6}
                  required
                />
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                  <p className="text-destructive" style={{ fontSize: 'var(--text-sm)' }}>
                    {error}
                  </p>
                </div>
              )}

              <SkeuomorphicButton
                type="submit"
                variant="primary"
                fullWidth
              >
                Verify & Continue
              </SkeuomorphicButton>

              <button
                type="button"
                onClick={() => {
                  setCodeSent(false);
                  setVerificationCode('');
                  setError('');
                }}
                className="w-full text-muted-foreground hover:text-foreground transition-colors"
                style={{ fontSize: 'var(--text-sm)' }}
              >
                Use a different email
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}