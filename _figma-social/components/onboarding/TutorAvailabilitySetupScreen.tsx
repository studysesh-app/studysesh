import { ArrowLeft, Check, Calendar, Clock, X } from 'lucide-react';
import { useState } from 'react';
import { CalendarPicker } from '../CalendarPicker';
import { motion, AnimatePresence } from 'motion/react';
import { IOSTimePicker } from '../IOSTimePicker';

interface TutorAvailabilitySetupScreenProps {
  onBack: () => void;
  onContinue: () => void;
}

interface DayTimeSlot {
  id: string;
  startTime: string;
  endTime: string;
}

interface DayAvailability {
  date: Date;
  dayName: string;
  slots: DayTimeSlot[];
}

export function TutorAvailabilitySetupScreen({ onBack, onContinue }: TutorAvailabilitySetupScreenProps) {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [dayAvailabilities, setDayAvailabilities] = useState<DayAvailability[]>([]);
  const [recurring, setRecurring] = useState<'weekly' | 'biweekly'>('weekly');
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);
  const [currentEditingDay, setCurrentEditingDay] = useState<Date | null>(null);

  // New slot state
  const [newSlotStartTime, setNewSlotStartTime] = useState('09:00');
  const [newSlotEndTime, setNewSlotEndTime] = useState('10:30');

  const getDayName = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const handleDateSelect = (date: Date) => {
    // Check if date is already selected using simple comparison
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    const isAlreadySelected = selectedDates.some((d) => {
      const dKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      return dKey === dateKey;
    });

    if (isAlreadySelected) {
      // Remove the date
      setSelectedDates(
        selectedDates.filter((d) => {
          const dKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
          return dKey !== dateKey;
        })
      );
      // Remove from day availabilities
      setDayAvailabilities(
        dayAvailabilities.filter((da) => {
          const dKey = `${da.date.getFullYear()}-${da.date.getMonth()}-${da.date.getDate()}`;
          return dKey !== dateKey;
        })
      );
    } else {
      // Add the date
      setSelectedDates([...selectedDates, date]);
      // Add empty day availability
      setDayAvailabilities([
        ...dayAvailabilities,
        {
          date,
          dayName: getDayName(date),
          slots: [],
        },
      ]);
    }
  };

  const handleAddTimeClick = (date: Date) => {
    setCurrentEditingDay(date);
    setNewSlotStartTime('09:00');
    setNewSlotEndTime('10:30');
    setShowAddSlotModal(true);
  };

  const handleSaveSlot = () => {
    if (!currentEditingDay) return;

    const dateKey = `${currentEditingDay.getFullYear()}-${currentEditingDay.getMonth()}-${currentEditingDay.getDate()}`;
    
    const newSlot: DayTimeSlot = {
      id: Date.now().toString(),
      startTime: newSlotStartTime,
      endTime: newSlotEndTime,
    };

    setDayAvailabilities(
      dayAvailabilities.map((da) => {
        const dKey = `${da.date.getFullYear()}-${da.date.getMonth()}-${da.date.getDate()}`;
        if (dKey === dateKey) {
          return {
            ...da,
            slots: [...da.slots, newSlot],
          };
        }
        return da;
      })
    );

    setShowAddSlotModal(false);
    setCurrentEditingDay(null);
  };

  const handleRemoveSlot = (date: Date, slotId: string) => {
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    
    setDayAvailabilities(
      dayAvailabilities.map((da) => {
        const dKey = `${da.date.getFullYear()}-${da.date.getMonth()}-${da.date.getDate()}`;
        if (dKey === dateKey) {
          return {
            ...da,
            slots: da.slots.filter((slot) => slot.id !== slotId),
          };
        }
        return da;
      })
    );
  };

  // Convert 24h time to 12h format
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Sort day availabilities by date
  const sortedDayAvailabilities = [...dayAvailabilities].sort((a, b) => a.date.getTime() - b.date.getTime());

  const hasSlots = dayAvailabilities.some((da) => da.slots.length > 0);

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

        {/* Calendar */}
        <div className="mb-6">
          <h3
            className="mb-3 text-foreground"
            style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}
          >
            Select Available Days
          </h3>
          <CalendarPicker
            key={selectedDates.map(d => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`).join(',')}
            availableDates={[]} // Allow all dates
            onDateSelect={handleDateSelect}
            selectedDates={selectedDates}
            multiSelect={true}
          />
          {selectedDates.length > 0 && (
            <p className="mt-2 text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
              {selectedDates.length} day{selectedDates.length !== 1 ? 's' : ''} selected
            </p>
          )}
        </div>

        {/* Day Cards with Time Slots */}
        {sortedDayAvailabilities.length > 0 && (
          <div className="mb-6">
            <h3
              className="mb-3 text-foreground"
              style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}
            >
              Available Time Slots
            </h3>
            <div className="space-y-3">
              {sortedDayAvailabilities.map((dayAvail) => (
                <div
                  key={`${dayAvail.date.getFullYear()}-${dayAvail.date.getMonth()}-${dayAvail.date.getDate()}`}
                  className="rounded-2xl p-4"
                  style={{
                    background: 'light-dark(linear-gradient(145deg, rgba(255, 255, 255, 1) 0%, rgba(248, 248, 248, 1) 100%), linear-gradient(145deg, rgba(30, 30, 30, 1) 0%, rgba(20, 20, 20, 1) 100%))',
                    boxShadow: 'light-dark(0 4 12 rgba(0, 0, 0, 0.08), inset 1 1 2 rgba(255, 255, 255, 0.9), inset -1 -1 2 rgba(0, 0, 0, 0.05), 0 4 12 rgba(0, 0, 0, 0.5), inset 1 1 2 rgba(50, 50, 50, 0.5), inset -1 -1 2 rgba(0, 0, 0, 0.3))',
                    border: '1px solid light-dark(rgba(230, 230, 230, 0.8), rgba(50, 50, 50, 0.8))',
                  }}
                >
                  <h4
                    className="mb-3 text-foreground"
                    style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}
                  >
                    {dayAvail.dayName}
                  </h4>

                  {dayAvail.slots.length === 0 ? (
                    <button
                      onClick={() => handleAddTimeClick(dayAvail.date)}
                      className="w-full py-3 rounded-xl transition-all hover:brightness-95"
                      style={{
                        background: 'light-dark(linear-gradient(145deg, rgba(245, 245, 245, 1) 0%, rgba(235, 235, 240, 1) 100%), linear-gradient(145deg, rgba(40, 40, 42, 1) 0%, rgba(30, 30, 32, 1) 100%))',
                        boxShadow: 'light-dark(inset 1 1 2 rgba(0, 0, 0, 0.08), inset -1 -1 2 rgba(255, 255, 255, 0.9), inset 1 1 2 rgba(60, 60, 60, 0.3), inset -1 -1 2 rgba(0, 0, 0, 0.5))',
                        border: '1px solid light-dark(rgba(220, 220, 220, 0.8), rgba(60, 60, 60, 0.8))',
                        color: 'var(--text-muted-foreground)',
                        fontSize: 'var(--text-sm)',
                        fontWeight: 'var(--font-weight-medium)',
                      }}
                    >
                      + Add time
                    </button>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2">
                      {dayAvail.slots.map((slot) => (
                        <div
                          key={slot.id}
                          className="flex items-center gap-1.5 rounded-full py-1.5 px-3 group"
                          style={{
                            background: 'linear-gradient(135deg, rgba(254, 202, 202, 1) 0%, rgba(252, 165, 165, 1) 100%)',
                            boxShadow: 'inset 0 1 2 rgba(0, 0, 0, 0.1), inset 0 -1 2 rgba(255, 255, 255, 0.5), 0 2 6 rgba(219, 35, 33, 0.2)',
                            border: '1px solid rgba(252, 165, 165, 0.5)',
                          }}
                        >
                          <span
                            style={{
                              fontSize: 'var(--text-sm)',
                              fontWeight: 'var(--font-weight-medium)',
                              color: '#991b1b',
                            }}
                          >
                            {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                          </span>
                          <button
                            onClick={() => handleRemoveSlot(dayAvail.date, slot.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3.5 h-3.5" style={{ color: '#991b1b' }} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => handleAddTimeClick(dayAvail.date)}
                        className="text-primary hover:underline"
                        style={{
                          fontSize: 'var(--text-sm)',
                          fontWeight: 'var(--font-weight-medium)',
                        }}
                      >
                        + Add time
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Box */}
        {hasSlots && (
          <div className="mt-6 p-4 bg-secondary/30 border border-border rounded-xl">
            <p className="text-muted-foreground text-center" style={{ fontSize: 'var(--text-sm)' }}>
              💡 You can update your availability anytime in your profile
            </p>
          </div>
        )}
      </div>

      {/* Continue Button */}
      <div className="px-4 py-4 bg-background border-t border-border flex-shrink-0">
        <button
          onClick={onContinue}
          disabled={selectedDates.length === 0 || !hasSlots}
          className="w-full py-4 bg-primary text-white rounded-full hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ 
            fontSize: 'var(--text-base)', 
            fontWeight: 'var(--font-weight-semibold)',
            boxShadow: '0 6 12 rgba(219, 35, 33, 0.4), inset 0 1 0 rgba(255, 255, 255, 0.2), inset 0 -1 0 rgba(0, 0, 0, 0.2)',
          }}
        >
          Complete Setup
        </button>
      </div>

      {/* Add Time Slot Modal - Slides up from bottom */}
      <AnimatePresence>
        {showAddSlotModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddSlotModal(false)}
              className="fixed inset-0 bg-black/50 z-40"
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
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden"
              style={{
                background: 'light-dark(#ffffff, #1a1a1a)',
                boxShadow: '0 -4 24 rgba(0, 0, 0, 0.2)',
                maxHeight: '80vh',
              }}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3
                    className="text-foreground"
                    style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-weight-bold)' }}
                  >
                    New Time Slot
                  </h3>
                  <button
                    onClick={() => setShowAddSlotModal(false)}
                    className="p-2 hover:bg-secondary rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-foreground" />
                  </button>
                </div>

                {/* Time Pickers */}
                <div className="space-y-4 mb-6">
                  {/* Start Time */}
                  <IOSTimePicker
                    label="Start:"
                    value={newSlotStartTime}
                    onChange={setNewSlotStartTime}
                  />

                  {/* End Time */}
                  <IOSTimePicker
                    label="End:"
                    value={newSlotEndTime}
                    onChange={setNewSlotEndTime}
                  />

                  {/* Recurrence Dropdown */}
                  <div>
                    <label
                      className="block mb-2 text-foreground"
                      style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
                    >
                      Repeat:
                    </label>
                    <select
                      value={recurring}
                      onChange={(e) => setRecurring(e.target.value as 'weekly' | 'biweekly')}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                      style={{ fontSize: 'var(--text-base)' }}
                    >
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Biweekly</option>
                    </select>
                  </div>
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSaveSlot}
                  className="w-full py-4 rounded-full transition-all hover:brightness-105 active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, rgba(254, 202, 202, 1) 0%, rgba(252, 165, 165, 1) 100%)',
                    boxShadow: 'inset 0 1 2 rgba(255, 255, 255, 0.5), inset 0 -1 2 rgba(0, 0, 0, 0.1), 0 4 12 rgba(219, 35, 33, 0.3)',
                    border: '1px solid rgba(252, 165, 165, 0.5)',
                    color: '#991b1b',
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-weight-semibold)',
                  }}
                >
                  Save Slot
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}