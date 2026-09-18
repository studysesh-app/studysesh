import { ArrowLeft, CreditCard, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal';
  last4?: string;
  brand?: string;
  email?: string;
}

interface PaymentMethodsScreenProps {
  paymentMethods: PaymentMethod[];
  onBack: () => void;
  onRemove: (methodId: string) => void;
  onAddPaymentMethod: () => void;
}

export function PaymentMethodsScreen({
  paymentMethods: initialMethods,
  onBack,
  onRemove,
  onAddPaymentMethod,
}: PaymentMethodsScreenProps) {
  const [paymentMethods, setPaymentMethods] = useState(initialMethods);

  const handleRemove = (methodId: string) => {
    if (confirm('Are you sure you want to remove this payment method?')) {
      setPaymentMethods(paymentMethods.filter((m) => m.id !== methodId));
      onRemove(methodId);
    }
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
          Payment Methods
        </h1>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {paymentMethods.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 rounded-full bg-secondary/30 flex items-center justify-center mb-4">
              <CreditCard size={32} className="text-muted-foreground" />
            </div>
            <h3
              className="text-foreground mb-2 text-center"
              style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-weight-semibold)',
              }}
            >
              No payment methods
            </h3>
            <p
              className="text-muted-foreground text-center max-w-xs"
              style={{
                fontSize: 'var(--text-sm)',
              }}
            >
              Add a payment method to book sessions
            </p>
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className="bg-card border border-border rounded-xl p-4 flex items-center gap-3"
              >
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-secondary/50 flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-6 h-6 text-primary" />
                </div>

                {/* Details */}
                <div className="flex-1">
                  {method.type === 'card' ? (
                    <>
                      <span
                        className="block text-foreground"
                        style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
                      >
                        {method.brand} •••• {method.last4}
                      </span>
                      <span className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                        Credit Card
                      </span>
                    </>
                  ) : (
                    <>
                      <span
                        className="block text-foreground"
                        style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
                      >
                        PayPal
                      </span>
                      <span className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                        {method.email}
                      </span>
                    </>
                  )}
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => handleRemove(method.id)}
                  className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Payment Method Button */}
      <div className="px-4 py-4 bg-background border-t border-border flex-shrink-0">
        <button
          onClick={onAddPaymentMethod}
          className="w-full py-4 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}
        >
          <Plus className="w-5 h-5" />
          Add Payment Method
        </button>
      </div>
    </div>
  );
}