import { X, MapPin, Video, Users, User as UserIcon } from 'lucide-react';
import { CourseChip } from './CourseChip';
import { PricingBubble } from './PricingBubble';
import { CalendarPicker } from './CalendarPicker';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

interface TimeSlot {
  time: string;
  type: 'group' | 'individual';
  price: string;
  spotsLeft?: number;
  totalSpots?: number;
  available: boolean;
  location: 'online' | 'in-person';
}

interface TutorDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  tutorName: string;
  pronouns: string;
  courses: string[];
  groupPrice: string | null;
  individualPrice: string | null;
  location: string[];
  bio?: string;
  onMessageTutor: () => void;
  onBookSession: (date: Date, timeSlot: TimeSlot) => void;
}

export function TutorDetailModal({
  isOpen,
  onClose,
  tutorName,
  pronouns,
  courses,
  groupPrice,
  individualPrice,
  location,
  bio,
  onMessageTutor,
  onBookSession,
}: TutorDetailModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [showFullBio, setShowFullBio] = useState(false);

  // Handle date selection with toggle functionality
  const handleDateSelect = (date: Date) => {
    // Use string key comparison for consistency
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    const selectedKey = selectedDate
      ? `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`
      : null;

    if (selectedKey && dateKey === selectedKey) {
      // Unselect if clicking the same date
      setSelectedDate(null);
      setSelectedTimeSlot(null);
    } else {
      // Select the new date
      setSelectedDate(date);
      setSelectedTimeSlot(null);
    }
  };

  // Generate unique availability based on tutor name
  const getAvailableDates = () => {
    // Create a simple hash from tutor name to generate different dates
    const hash = tutorName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const startDay = 18 + (hash % 5); // Different starting day for each tutor
    
    const dates = [];
    for (let i = 0; i < 6; i++) {
      const dayOffset = startDay + i + (i > 2 ? 1 : 0); // Skip one day in the middle
      dates.push(new Date(2025, 10, dayOffset));
    }
    return dates;
  };

  const availableDates = getAvailableDates();

  // Mock time slots based on selected date and tutor
  const getTimeSlots = (): TimeSlot[] => {
    if (!selectedDate) return [];
    
    // Generate different time patterns based on tutor
    const hash = tutorName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hasOnline = location.includes('online');
    const hasInPerson = location.includes('in-person');
    
    const slots: TimeSlot[] = [];
    
    // Helper to get location for a slot
    const getLocation = (slotIndex: number): 'online' | 'in-person' => {
      if (hasOnline && hasInPerson) {
        // Mix both if tutor offers both
        return slotIndex % 2 === 0 ? 'online' : 'in-person';
      } else if (hasOnline) {
        return 'online';
      } else {
        return 'in-person';
      }
    };
    
    if (groupPrice && groupPrice !== 'Free') {
      // Different times based on tutor
      const morningTime = hash % 2 === 0 ? '9:00 AM' : '10:00 AM';
      const afternoonTime = hash % 2 === 0 ? '2:00 PM' : '3:00 PM';
      const eveningTime = hash % 2 === 0 ? '4:00 PM' : '5:00 PM';
      
      slots.push(
        { 
          time: morningTime, 
          type: 'group', 
          price: groupPrice, 
          spotsLeft: 5 + (hash % 3), 
          totalSpots: 8, 
          available: true, 
          location: getLocation(0)
        },
        { 
          time: afternoonTime, 
          type: 'group', 
          price: groupPrice, 
          spotsLeft: 2 + (hash % 4), 
          totalSpots: 8, 
          available: true, 
          location: getLocation(1)
        },
        { 
          time: eveningTime, 
          type: 'group', 
          price: groupPrice, 
          spotsLeft: 0, 
          totalSpots: 8, 
          available: hash % 3 !== 0, 
          location: getLocation(2)
        },
      );
    }
    
    if (individualPrice && individualPrice !== 'Free') {
      // Different times based on tutor
      const slot1Time = hash % 2 === 0 ? '11:00 AM' : '12:00 PM';
      const slot2Time = hash % 2 === 0 ? '1:00 PM' : '2:00 PM';
      const slot3Time = hash % 2 === 0 ? '6:00 PM' : '7:00 PM';
      
      slots.push(
        { 
          time: slot1Time, 
          type: 'individual', 
          price: individualPrice, 
          available: true, 
          location: getLocation(0)
        },
        { 
          time: slot2Time, 
          type: 'individual', 
          price: individualPrice, 
          available: true, 
          location: getLocation(1)
        },
        { 
          time: slot3Time, 
          type: 'individual', 
          price: individualPrice, 
          available: hash % 4 !== 0, 
          location: getLocation(2)
        },
      );
    }
    
    return slots.sort((a, b) => {
      // Sort by time
      const timeA = parseInt(a.time.split(':')[0]) + (a.time.includes('PM') && !a.time.includes('12') ? 12 : 0);
      const timeB = parseInt(b.time.split(':')[0]) + (b.time.includes('PM') && !b.time.includes('12') ? 12 : 0);
      return timeA - timeB;
    });
  };

  const timeSlots = getTimeSlots();
  const tutorInitial = tutorName.charAt(0);

  const handleBookSession = () => {
    if (selectedDate && selectedTimeSlot) {
      onBookSession(selectedDate, selectedTimeSlot);
    }
  };

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
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ 
              type: 'spring',
              stiffness: 300,
              damping: 30,
            }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-3xl max-h-[85vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="overflow-y-auto max-h-[85vh]">{/* Changed from 70vh to 85vh */}

              {/* Header */}
              <div className="sticky top-0 bg-background border-b border-border px-4 py-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full bg-[#500908] flex items-center justify-center text-white flex-shrink-0"
                    style={{
                      fontSize: 'var(--text-xl)',
                      fontWeight: 'var(--font-weight-semibold)',
                    }}
                  >
                    {tutorInitial}
                  </div>
                  <div>
                    <h2
                      className="text-foreground"
                      style={{
                        fontSize: 'var(--text-xl)',
                        fontWeight: 'var(--font-weight-bold)',
                      }}
                    >
                      {tutorName}
                    </h2>
                    <p
                      className="text-muted-foreground"
                      style={{
                        fontSize: 'var(--text-sm)',
                      }}
                    >
                      {pronouns}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full hover:bg-secondary/50 flex items-center justify-center transition-colors"
                >
                  <X size={24} className="text-foreground" />
                </button>
              </div>

              {/* Content */}
              <div className="px-4 py-6 pb-32">
                {/* Courses */}
                <div className="mb-6">
                  <h3
                    className="mb-3 text-foreground"
                    style={{
                      fontSize: 'var(--text-base)',
                      fontWeight: 'var(--font-weight-semibold)',
                    }}
                  >
                    Courses
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {courses.map((course) => (
                      <CourseChip key={course} code={course} variant="large" />
                    ))}
                  </div>
                </div>

                {/* Pricing & Session Types */}
                <div className="mb-6">
                  <h3
                    className="mb-3 text-foreground"
                    style={{
                      fontSize: 'var(--text-base)',
                      fontWeight: 'var(--font-weight-semibold)',
                    }}
                  >
                    Pricing
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {groupPrice && (
                      <PricingBubble type="group" price={groupPrice} size="md" />
                    )}
                    {individualPrice && (
                      <PricingBubble type="individual" price={individualPrice} size="md" />
                    )}
                  </div>
                </div>

                {/* Location/Format */}
                <div className="mb-6">
                  <h3
                    className="mb-3 text-foreground"
                    style={{
                      fontSize: 'var(--text-base)',
                      fontWeight: 'var(--font-weight-semibold)',
                    }}
                  >
                    Session Format
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {location.map((loc) => (
                      <div
                        key={loc}
                        className="px-3 py-1.5 rounded-full bg-secondary/50 flex items-center gap-1.5"
                      >
                        {loc === 'online' ? (
                          <Video size={14} className="text-muted-foreground" />
                        ) : (
                          <MapPin size={14} className="text-muted-foreground" />
                        )}
                        <span
                          className="text-foreground capitalize"
                          style={{
                            fontSize: 'var(--text-sm)',
                          }}
                        >
                          {loc}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bio (if provided) */}
                {bio && (
                  <div className="mb-6">
                    <h3
                      className="mb-2 text-foreground"
                      style={{
                        fontSize: 'var(--text-base)',
                        fontWeight: 'var(--font-weight-semibold)',
                      }}
                    >
                      About
                    </h3>
                    <p
                      className="text-muted-foreground"
                      style={{
                        fontSize: 'var(--text-sm)',
                        lineHeight: '1.6',
                      }}
                    >
                      {showFullBio ? bio : `${bio.slice(0, 120)}...`}
                    </p>
                    {bio.length > 120 && (
                      <button
                        onClick={() => setShowFullBio(!showFullBio)}
                        className="text-primary mt-2"
                        style={{
                          fontSize: 'var(--text-sm)',
                          fontWeight: 'var(--font-weight-semibold)',
                        }}
                      >
                        {showFullBio ? 'Show less' : 'Show more'}
                      </button>
                    )}
                  </div>
                )}

                {/* Calendar */}
                <div className="mb-6">
                  <h3
                    className="mb-3 text-foreground"
                    style={{
                      fontSize: 'var(--text-base)',
                      fontWeight: 'var(--font-weight-semibold)',
                    }}
                  >
                    Select Date
                  </h3>
                  <CalendarPicker
                    key={selectedDate ? `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}` : 'no-selection'}
                    selectedDate={selectedDate}
                    onSelectDate={handleDateSelect}
                    availableDates={availableDates}
                  />
                </div>

                {/* Time Slots */}
                {selectedDate && timeSlots.length > 0 && (
                  <div className="mb-6">
                    <h3
                      className="mb-3 text-foreground"
                      style={{
                        fontSize: 'var(--text-base)',
                        fontWeight: 'var(--font-weight-semibold)',
                      }}
                    >
                      Available Time Slots
                    </h3>
                    <div className="space-y-2">
                      {timeSlots.map((slot, index) => (
                        <button
                          key={index}
                          onClick={() => slot.available && setSelectedTimeSlot(slot)}
                          disabled={!slot.available}
                          className={`w-full p-4 rounded-2xl border-2 transition-all ${
                            selectedTimeSlot === slot
                              ? 'border-primary bg-primary/5'
                              : slot.available
                              ? 'border-border hover:border-primary/30 bg-background'
                              : 'border-border bg-secondary/20 cursor-not-allowed opacity-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {slot.type === 'group' ? (
                                <Users size={20} className="text-muted-foreground" />
                              ) : (
                                <UserIcon size={20} className="text-muted-foreground" />
                              )}
                              <div className="text-left">
                                <div className="flex items-center gap-2">
                                  <p
                                    className="text-foreground"
                                    style={{
                                      fontSize: 'var(--text-base)',
                                      fontWeight: 'var(--font-weight-semibold)',
                                    }}
                                  >
                                    {slot.time}
                                  </p>
                                  {slot.location === 'online' ? (
                                    <Video size={14} className="text-muted-foreground" />
                                  ) : (
                                    <MapPin size={14} className="text-muted-foreground" />
                                  )}
                                </div>
                                {slot.type === 'group' && slot.spotsLeft !== undefined && (
                                  <p
                                    className="text-muted-foreground"
                                    style={{
                                      fontSize: 'var(--text-xs)',
                                    }}
                                  >
                                    {slot.available
                                      ? `${slot.spotsLeft}/${slot.totalSpots} spots left`
                                      : 'Full'}
                                  </p>
                                )}
                                {!slot.available && slot.type === 'individual' && (
                                  <p
                                    className="text-muted-foreground"
                                    style={{
                                      fontSize: 'var(--text-xs)',
                                    }}
                                  >
                                    Unavailable
                                  </p>
                                )}
                              </div>
                            </div>
                            <PricingBubble
                              type={slot.type}
                              price={slot.price}
                              size="sm"
                            />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Fixed bottom actions */}
              <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-4 py-4 z-10" style={{ maxWidth: '448px', margin: '0 auto' }}>
                <div className="flex gap-3">
                  <button
                    onClick={onMessageTutor}
                    className="flex-1 py-3 rounded-2xl border-2 border-primary text-primary hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
                    style={{
                      fontSize: 'var(--text-base)',
                      fontWeight: 'var(--font-weight-semibold)',
                    }}
                  >
                    💬 Message Tutor
                  </button>
                  <button
                    onClick={handleBookSession}
                    disabled={!selectedDate || !selectedTimeSlot}
                    className={`flex-1 py-3 rounded-2xl transition-colors flex items-center justify-center gap-2 ${
                      selectedDate && selectedTimeSlot
                        ? 'bg-primary text-white hover:bg-primary-dark'
                        : 'bg-secondary/50 text-muted-foreground cursor-not-allowed'
                    }`}
                    style={{
                      fontSize: 'var(--text-base)',
                      fontWeight: 'var(--font-weight-semibold)',
                    }}
                  >
                    📅 Book Session
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}