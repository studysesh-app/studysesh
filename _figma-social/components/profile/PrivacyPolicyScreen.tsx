import { ArrowLeft } from 'lucide-react';

interface PrivacyPolicyScreenProps {
  onBack: () => void;
}

export function PrivacyPolicyScreen({ onBack }: PrivacyPolicyScreenProps) {
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
          Privacy Policy
        </h1>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="space-y-6 max-w-2xl">
          <div>
            <p className="text-muted-foreground mb-4" style={{ fontSize: 'var(--text-sm)' }}>
              Last updated: November 19, 2025
            </p>
          </div>

          <section>
            <h2
              className="text-foreground mb-3"
              style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)' }}
            >
              1. Information We Collect
            </h2>
            <p className="text-foreground mb-3" style={{ fontSize: 'var(--text-base)' }}>
              We collect information you provide directly to us, including:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground" style={{ fontSize: 'var(--text-base)' }}>
              <li>Name, email, and profile information</li>
              <li>Academic information (courses, program, year)</li>
              <li>Communication between students and tutors</li>
              <li>Booking and session history</li>
            </ul>
          </section>

          <section>
            <h2
              className="text-foreground mb-3"
              style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)' }}
            >
              2. How We Use Your Information
            </h2>
            <p className="text-foreground mb-3" style={{ fontSize: 'var(--text-base)' }}>
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground" style={{ fontSize: 'var(--text-base)' }}>
              <li>Provide, maintain, and improve our services</li>
              <li>Connect students with appropriate tutors</li>
              <li>Send notifications about bookings and sessions</li>
              <li>Ensure platform safety and prevent fraud</li>
            </ul>
          </section>

          <section>
            <h2
              className="text-foreground mb-3"
              style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)' }}
            >
              3. Information Sharing
            </h2>
            <p className="text-foreground" style={{ fontSize: 'var(--text-base)' }}>
              We do not sell your personal information. We share information only with:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground mt-3" style={{ fontSize: 'var(--text-base)' }}>
              <li>Other users as necessary to facilitate sessions (e.g., showing your name to your tutor)</li>
              <li>Service providers who assist in operating our platform</li>
              <li>Law enforcement when required by law</li>
            </ul>
          </section>

          <section>
            <h2
              className="text-foreground mb-3"
              style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)' }}
            >
              4. Data Security
            </h2>
            <p className="text-foreground" style={{ fontSize: 'var(--text-base)' }}>
              We implement appropriate security measures to protect your personal information. However, no system is
              100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2
              className="text-foreground mb-3"
              style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)' }}
            >
              5. Your Rights
            </h2>
            <p className="text-foreground mb-3" style={{ fontSize: 'var(--text-base)' }}>
              You have the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground" style={{ fontSize: 'var(--text-base)' }}>
              <li>Access and update your personal information</li>
              <li>Delete your account and associated data</li>
              <li>Opt out of marketing communications</li>
              <li>Request a copy of your data</li>
            </ul>
          </section>

          <section>
            <h2
              className="text-foreground mb-3"
              style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)' }}
            >
              6. Contact Us
            </h2>
            <p className="text-foreground" style={{ fontSize: 'var(--text-base)' }}>
              If you have questions about this Privacy Policy, please contact us at{' '}
              <a href="mailto:ksmavai2005@gmail.com" className="text-primary hover:underline">
                ksmavai2005@gmail.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
