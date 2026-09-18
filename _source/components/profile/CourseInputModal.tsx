import { X } from 'lucide-react';
import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';

interface CourseInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (courseCode: string) => void;
  requiresProof?: boolean;
  onProofUpload?: (file: File) => void;
}

export function CourseInputModal({ isOpen, onClose, onAdd, requiresProof, onProofUpload }: CourseInputModalProps) {
  const [prefix, setPrefix] = useState('');
  const [suffix, setSuffix] = useState('');
  const [proofUploaded, setProofUploaded] = useState(false);

  const handlePrefixChange = (value: string) => {
    // Only allow letters, max 4 characters
    const letters = value.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 4);
    setPrefix(letters);
  };

  const handleSuffixChange = (value: string) => {
    // Only allow numbers, max 4 characters
    const numbers = value.replace(/[^0-9]/g, '').slice(0, 4);
    setSuffix(numbers);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onProofUpload) {
      onProofUpload(file);
      setProofUploaded(true);
    }
  };

  const handleAdd = () => {
    if (prefix.length === 4 && suffix.length === 4) {
      if (requiresProof && !proofUploaded) {
        alert('Please upload proof of course enrollment');
        return;
      }
      onAdd(`${prefix} ${suffix}`);
      // Reset
      setPrefix('');
      setSuffix('');
      setProofUploaded(false);
      onClose();
    }
  };

  const isValid = prefix.length === 4 && suffix.length === 4;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-[380px] bg-card border border-border rounded-2xl p-6 z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3
                className="text-foreground"
                style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-bold)' }}
              >
                Add Course
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-secondary rounded-lg transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5 text-foreground" />
              </button>
            </div>

            {/* Input Fields */}
            <div className="mb-6">
              <label
                className="block mb-2 text-foreground"
                style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
              >
                Course Code
              </label>
              <div className="flex gap-2 min-w-0">
                <input
                  type="text"
                  value={prefix}
                  onChange={(e) => handlePrefixChange(e.target.value)}
                  placeholder="SYSC"
                  className="flex-1 min-w-0 px-3 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground text-center uppercase"
                  style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-semibold)' }}
                  maxLength={4}
                />
                <input
                  type="text"
                  value={suffix}
                  onChange={(e) => handleSuffixChange(e.target.value)}
                  placeholder="4101"
                  className="flex-1 min-w-0 px-3 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground text-center"
                  style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-weight-semibold)' }}
                  maxLength={4}
                />
              </div>
              <p className="mt-2 text-muted-foreground" style={{ fontSize: 'var(--text-xs)' }}>
                Enter 4 letters + 4 numbers (e.g., SYSC 4101)
              </p>
            </div>

            {/* Proof Upload (Tutor only) */}
            {requiresProof && (
              <div className="mb-6">
                <label
                  className="block mb-2 text-foreground"
                  style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
                >
                  Course Enrollment Proof
                </label>
                <label className="block">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div
                    className={`px-4 py-3 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                      proofUploaded
                        ? 'border-green-600 bg-green-600/10'
                        : 'border-border hover:border-primary bg-background'
                    }`}
                  >
                    <p
                      className={`text-center ${proofUploaded ? 'text-green-600' : 'text-muted-foreground'}`}
                      style={{ fontSize: 'var(--text-sm)' }}
                    >
                      {proofUploaded ? '✓ Proof uploaded' : 'Click to upload screenshot or PDF'}
                    </p>
                  </div>
                </label>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-secondary text-foreground rounded-full hover:bg-secondary/80 transition-colors"
                style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={!isValid || (requiresProof && !proofUploaded)}
                className="flex-1 py-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}
              >
                Add Course
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}