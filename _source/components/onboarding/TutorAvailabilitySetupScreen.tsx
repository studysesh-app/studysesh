import { ArrowLeft, Check, Calendar, Clock } from 'lucide-react';
import { useState } from 'react';

interface TutorAvailabilitySetupScreenProps {
  onBack: () => void;
  onContinue: () => void;
}

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TIME_SLOTS = [
  '9:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '1:00 PM',
  '2:00 PM',
  '3:00 PM',
  '4:00 PM',
  '5:00 PM',
  '6:00 PM',
];

export function TutorAvailabilitySetupScreen({ onBack, onContinue }: TutorAvailabilitySetupScreenProps) {
  const [selectedDays, setSelectedDays] = useState<string[]>(['Mon', 'Wed', 'Fri']);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>(['2:00 PM', '3:00 PM', '4:00 PM']);
  const [recurring, setRecurring] = useState(true);

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const toggleTimeSlot = (slot: string) => {
    setSelectedTimeSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );
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
          Set Your Availability
        </h1>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <p
          className="text-muted-foreground mb-6 text-center"
          style={{ fontSize: 'var(--text-base)' }}
        >
          Choose when you're available to tutor
        </p>

        {/* Recurring Toggle */}
        <div className="mb-6">
          <button
            onClick={() => setRecurring(!recurring)}
            className="flex items-center gap-3 w-full p-4 bg-card border border-border rounded-xl hover:bg-secondary/50 transition-colors"
          >
            <div
              className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                recurring ? 'bg-primary border-primary' : 'border-border'
              }`}
            >
              {recurring && <Check className="w-4 h-4 text-white" />}
            </div>
            <div className="flex-1 text-left">
              <span
                className="block text-foreground"
                style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
              >
                Set as recurring weekly schedule
              </span>
              <span className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                Apply this schedule every week
              </span>
            </div>
          </button>
        </div>

        {/* Days of Week */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-5 h-5 text-foreground" />
            <label
              className="text-foreground"
              style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}
            >
              Available Days
            </label>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {DAYS_OF_WEEK.map((day) => {
              const isSelected = selectedDays.includes(day);
              return (
                <button
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={`py-3 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'bg-primary border-primary text-white'
                      : 'bg-card border-border text-foreground hover:border-primary/50'
                  }`}
                  style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)' }}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Slots */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-foreground" />
            <label
              className="text-foreground"
              style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}
            >
              Available Time Slots
            </label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {TIME_SLOTS.map((slot) => {
              const isSelected = selectedTimeSlots.includes(slot);
              return (
                <button
                  key={slot}
                  onClick={() => toggleTimeSlot(slot)}
                  className={`py-3 px-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'bg-primary border-primary text-white'
                      : 'bg-card border-border text-foreground hover:border-primary/50'
                  }`}
                  style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
                >
                  {slot}
                </button>
              );
            })}
          </div>
        </div>

        {/* Summary */}
        {selectedDays.length > 0 && selectedTimeSlots.length > 0 && (
          <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-xl">
            <h4
              className="mb-2 text-foreground"
              style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-semibold)' }}
            >
              Your Availability Summary
            </h4>
            <p className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
              {selectedDays.length} day{selectedDays.length !== 1 ? 's' : ''} • {selectedTimeSlots.length} time slot
              {selectedTimeSlots.length !== 1 ? 's' : ''} • {selectedDays.length * selectedTimeSlots.length} total session
              {selectedDays.length * selectedTimeSlots.length !== 1 ? 's' : ''} per week
            </p>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 p-4 bg-secondary/30 border border-border rounded-xl">
          <p className="text-muted-foreground text-center" style={{ fontSize: 'var(--text-sm)' }}>
            💡 You can update your availability anytime in your profile
          </p>
        </div>
      </div>

      {/* Continue Button */}
      <div className="px-4 py-4 bg-background border-t border-border flex-shrink-0">
        <button
          onClick={onContinue}
          className="w-full py-4 bg-primary text-white rounded-full hover:bg-primary/90 transition-all"
          style={{ 
            fontSize: 'var(--text-base)', 
            fontWeight: 'var(--font-weight-semibold)',
            boxShadow: '0 6px 12px rgba(219, 35, 33, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.2)',
          }}
        >
          Complete Setup
        </button>
      </div>
    </div>
  );
}