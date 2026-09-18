import { ArrowLeft } from 'lucide-react';

interface TermsOfServiceScreenProps {
  onBack: () => void;
}

export function TermsOfServiceScreen({ onBack }: TermsOfServiceScreenProps) {
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
          Terms of Service
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
              1. Acceptance of Terms
            </h2>
            <p className="text-foreground" style={{ fontSize: 'var(--text-base)' }}>
              By accessing and using this peer tutoring platform, you accept and agree to be bound by these Terms of
              Service. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2
              className="text-foreground mb-3"
              style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)' }}
            >
              2. User Eligibility
            </h2>
            <p className="text-foreground mb-3" style={{ fontSize: 'var(--text-base)' }}>
              To use this platform, you must:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground" style={{ fontSize: 'var(--text-base)' }}>
              <li>Be a currently enrolled university student</li>
              <li>Provide accurate and truthful information</li>
              <li>Maintain the confidentiality of your account</li>
              <li>Be at least 18 years old or have parental consent</li>
            </ul>
          </section>

          <section>
            <h2
              className="text-foreground mb-3"
              style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)' }}
            >
              3. Tutor Responsibilities
            </h2>
            <p className="text-foreground mb-3" style={{ fontSize: 'var(--text-base)' }}>
              Tutors agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground" style={{ fontSize: 'var(--text-base)' }}>
              <li>Provide accurate information about their qualifications</li>
              <li>Submit proof of course completion for courses they tutor</li>
              <li>Maintain professional conduct during all sessions</li>
              <li>Honor confirmed bookings or provide reasonable notice of cancellation</li>
              <li>Not engage in academic dishonesty or assist students in cheating</li>
            </ul>
          </section>

          <section>
            <h2
              className="text-foreground mb-3"
              style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)' }}
            >
              4. Student Responsibilities
            </h2>
            <p className="text-foreground mb-3" style={{ fontSize: 'var(--text-base)' }}>
              Students agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground" style={{ fontSize: 'var(--text-base)' }}>
              <li>Treat tutors with respect</li>
              <li>Attend confirmed sessions or provide notice of cancellation</li>
              <li>Use tutoring services for learning support, not academic dishonesty</li>
              <li>Provide honest feedback about tutoring experiences</li>
            </ul>
          </section>

          <section>
            <h2
              className="text-foreground mb-3"
              style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)' }}
            >
              5. Prohibited Conduct
            </h2>
            <p className="text-foreground mb-3" style={{ fontSize: 'var(--text-base)' }}>
              Users may not:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground" style={{ fontSize: 'var(--text-base)' }}>
              <li>Harass, threaten, or abuse other users</li>
              <li>Share inappropriate or offensive content</li>
              <li>Attempt to manipulate pricing or availability</li>
              <li>Use the platform for purposes other than legitimate tutoring</li>
              <li>Circumvent the platform to avoid service fees</li>
            </ul>
          </section>

          <section>
            <h2
              className="text-foreground mb-3"
              style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)' }}
            >
              6. Cancellation and Refunds
            </h2>
            <p className="text-foreground" style={{ fontSize: 'var(--text-base)' }}>
              Cancellations made more than 24 hours before a session are eligible for a full refund. Cancellations
              within 24 hours may incur fees. No-shows without notice forfeit payment.
            </p>
          </section>

          <section>
            <h2
              className="text-foreground mb-3"
              style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)' }}
            >
              7. Platform Fees
            </h2>
            <p className="text-foreground" style={{ fontSize: 'var(--text-base)' }}>
              The platform may charge service fees on bookings. These fees will be clearly displayed before booking
              confirmation.
            </p>
          </section>

          <section>
            <h2
              className="text-foreground mb-3"
              style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)' }}
            >
              8. Limitation of Liability
            </h2>
            <p className="text-foreground" style={{ fontSize: 'var(--text-base)' }}>
              The platform facilitates connections between students and tutors but is not responsible for the quality of
              tutoring services, academic outcomes, or disputes between users.
            </p>
          </section>

          <section>
            <h2
              className="text-foreground mb-3"
              style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)' }}
            >
              9. Termination
            </h2>
            <p className="text-foreground" style={{ fontSize: 'var(--text-base)' }}>
              We reserve the right to suspend or terminate accounts that violate these terms or engage in inappropriate
              behavior.
            </p>
          </section>

          <section>
            <h2
              className="text-foreground mb-3"
              style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)' }}
            >
              10. Contact
            </h2>
            <p className="text-foreground" style={{ fontSize: 'var(--text-base)' }}>
              Questions about these Terms of Service? Contact us at{' '}
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
