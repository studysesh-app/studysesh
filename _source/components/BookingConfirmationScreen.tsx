import { X, Calendar, Clock, MapPin, Video, Users, User as UserIcon } from 'lucide-react';
import { CourseChip } from './CourseChip';
import { PricingBubble } from './PricingBubble';
import { motion, AnimatePresence } from 'motion/react';

interface BookingDetails {
  tutorName: string;
  tutorInitial: string;
  course: string;
  date: string;
  time: string;
  sessionType: 'group' | 'individual';
  price: string;
  location: 'online' | 'in-person';
  locationDetails?: string;
  spotsLeft?: number;
  totalSpots?: number;
}

interface BookingConfirmationScreenProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingDetails;
  onConfirm: () => void;
  onCancel: () => void;
}

export function BookingConfirmationScreen({
  isOpen,
  onClose,
  booking,
  onConfirm,
  onCancel,
}: BookingConfirmationScreenProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-background rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="border-b border-border px-6 py-4 flex items-center justify-between">
                <h2
                  style={{
                    fontSize: 'var(--text-xl)',
                    fontWeight: 'var(--font-weight-bold)',
                  }}
                >
                  Confirm Booking
                </h2>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full hover:bg-secondary/50 flex items-center justify-center transition-colors"
                >
                  <X size={24} className="text-foreground" />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 py-6">
                {/* Tutor Info */}
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-14 h-14 rounded-full bg-[#500908] flex items-center justify-center text-white flex-shrink-0"
                    style={{
                      fontSize: 'var(--text-xl)',
                      fontWeight: 'var(--font-weight-semibold)',
                    }}
                  >
                    {booking.tutorInitial}
                  </div>
                  <div>
                    <h3
                      style={{
                        fontSize: 'var(--text-lg)',
                        fontWeight: 'var(--font-weight-bold)',
                      }}
                    >
                      {booking.tutorName}
                    </h3>
                    <CourseChip code={booking.course} variant="small" />
                  </div>
                </div>

                {/* Session Details Card */}
                <div className="bg-secondary/30 rounded-2xl p-4 mb-6 space-y-4">
                  {/* Date */}
                  <div className="flex items-start gap-3">
                    <Calendar size={20} className="text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p
                        className="text-muted-foreground mb-1"
                        style={{
                          fontSize: 'var(--text-xs)',
                        }}
                      >
                        Date
                      </p>
                      <p
                        className="text-foreground"
                        style={{
                          fontSize: 'var(--text-base)',
                          fontWeight: 'var(--font-weight-semibold)',
                        }}
                      >
                        {booking.date}
                      </p>
                    </div>
                  </div>

                  {/* Time */}
                  <div className="flex items-start gap-3">
                    <Clock size={20} className="text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p
                        className="text-muted-foreground mb-1"
                        style={{
                          fontSize: 'var(--text-xs)',
                        }}
                      >
                        Time
                      </p>
                      <p
                        className="text-foreground"
                        style={{
                          fontSize: 'var(--text-base)',
                          fontWeight: 'var(--font-weight-semibold)',
                        }}
                      >
                        {booking.time}
                      </p>
                    </div>
                  </div>

                  {/* Session Type */}
                  <div className="flex items-start gap-3">
                    {booking.sessionType === 'group' ? (
                      <Users size={20} className="text-primary mt-0.5 flex-shrink-0" />
                    ) : (
                      <UserIcon size={20} className="text-primary mt-0.5 flex-shrink-0" />
                    )}
                    <div>
                      <p
                        className="text-muted-foreground mb-1"
                        style={{
                          fontSize: 'var(--text-xs)',
                        }}
                      >
                        Session Type
                      </p>
                      <div className="flex items-center gap-2">
                        <p
                          className="text-foreground"
                          style={{
                            fontSize: 'var(--text-base)',
                            fontWeight: 'var(--font-weight-semibold)',
                          }}
                        >
                          {booking.sessionType === 'group' ? 'Group Session' : 'One-on-One'}
                        </p>
                        {booking.sessionType === 'group' && booking.spotsLeft && (
                          <span
                            className="text-muted-foreground"
                            style={{
                              fontSize: 'var(--text-xs)',
                            }}
                          >
                            ({booking.spotsLeft}/{booking.totalSpots} spots)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Location/Format */}
                  <div className="flex items-start gap-3">
                    {booking.location === 'online' ? (
                      <Video size={20} className="text-primary mt-0.5 flex-shrink-0" />
                    ) : (
                      <MapPin size={20} className="text-primary mt-0.5 flex-shrink-0" />
                    )}
                    <div>
                      <p
                        className="text-muted-foreground mb-1"
                        style={{
                          fontSize: 'var(--text-xs)',
                        }}
                      >
                        Location
                      </p>
                      <p
                        className="text-foreground"
                        style={{
                          fontSize: 'var(--text-base)',
                          fontWeight: 'var(--font-weight-semibold)',
                        }}
                      >
                        {booking.location === 'online' ? 'Online via Zoom' : booking.locationDetails || 'In-person'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="bg-primary/5 rounded-2xl p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span
                      className="text-foreground"
                      style={{
                        fontSize: 'var(--text-base)',
                        fontWeight: 'var(--font-weight-semibold)',
                      }}
                    >
                      Total Amount
                    </span>
                    <div className="flex items-center gap-2">
                      <PricingBubble
                        type={booking.sessionType}
                        price={booking.price}
                        size="md"
                      />
                    </div>
                  </div>
                  {booking.sessionType === 'group' && (
                    <p
                      className="text-muted-foreground mt-2"
                      style={{
                        fontSize: 'var(--text-xs)',
                      }}
                    >
                      ${booking.price} per student
                    </p>
                  )}
                </div>

                {/* Info message */}
                <div className="bg-secondary/30 rounded-xl p-3 mb-6">
                  <p
                    className="text-muted-foreground text-center"
                    style={{
                      fontSize: 'var(--text-sm)',
                      lineHeight: '1.5',
                    }}
                  >
                    Your booking will be sent to the tutor for confirmation. You'll receive a notification once it's accepted.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t border-border px-6 py-4 flex gap-3">
                <button
                  onClick={onCancel}
                  className="flex-1 py-3.5 rounded-full border-2 border-foreground text-foreground hover:bg-foreground hover:text-white transition-colors text-center"
                  style={{
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-weight-semibold)',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 py-3.5 rounded-full bg-primary text-white hover:bg-[#500908] transition-colors text-center"
                  style={{
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-weight-semibold)',
                  }}
                >
                  Confirm Booking
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}