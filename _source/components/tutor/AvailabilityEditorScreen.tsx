import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { CalendarPicker } from '../CalendarPicker';

interface TimeSlot {
  id: string;
  time: string;
  duration: number; // in minutes
  type: 'group' | 'individual';
  location: 'online' | 'in-person';
  maxStudents?: number;
}

interface AvailabilityEditorScreenProps {
  onBack: () => void;
  onSave: (data: {
    dates: Date[];
    timeSlots: TimeSlot[];
    recurring: 'none' | 'weekly' | 'biweekly';
  }) => void;
}

export function AvailabilityEditorScreen({ onBack, onSave }: AvailabilityEditorScreenProps) {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [recurring, setRecurring] = useState<'none' | 'weekly' | 'biweekly'>('none');
  const [showAddSlot, setShowAddSlot] = useState(false);

  // New slot state
  const [newSlotTime, setNewSlotTime] = useState('10:00');
  const [newSlotDuration, setNewSlotDuration] = useState(60);
  const [newSlotType, setNewSlotType] = useState<'group' | 'individual'>('group');
  const [newSlotLocation, setNewSlotLocation] = useState<'online' | 'in-person'>('online');
  const [newSlotMaxStudents, setNewSlotMaxStudents] = useState(8);

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
    } else {
      // Add the date
      setSelectedDates([...selectedDates, date]);
    }
  };

  const handleAddTimeSlot = () => {
    const newSlot: TimeSlot = {
      id: Date.now().toString(),
      time: newSlotTime,
      duration: newSlotDuration,
      type: newSlotType,
      location: newSlotLocation,
      maxStudents: newSlotType === 'group' ? newSlotMaxStudents : undefined,
    };
    setTimeSlots([...timeSlots, newSlot]);
    setShowAddSlot(false);
    // Reset form
    setNewSlotTime('10:00');
    setNewSlotDuration(60);
    setNewSlotType('group');
    setNewSlotLocation('online');
    setNewSlotMaxStudents(8);
  };

  const handleRemoveSlot = (id: string) => {
    setTimeSlots(timeSlots.filter((slot) => slot.id !== id));
  };

  const handleSave = () => {
    if (selectedDates.length === 0 || timeSlots.length === 0) {
      alert('Please select at least one date and add at least one time slot');
      return;
    }
    onSave({
      dates: selectedDates,
      timeSlots,
      recurring,
    });
  };

  // Convert 24h time to 12h format
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
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
          Edit Availability
        </h1>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {/* Calendar */}
        <div className="mb-6">
          <h3
            className="mb-3 text-foreground"
            style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}
          >
            Select Available Dates
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
              {selectedDates.length} date{selectedDates.length !== 1 ? 's' : ''} selected
            </p>
          )}
        </div>

        {/* Recurring Toggle */}
        <div className="mb-6">
          <h3
            className="mb-3 text-foreground"
            style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}
          >
            Recurring Pattern
          </h3>
          <div className="flex gap-2">
            {(['none', 'weekly', 'biweekly'] as const).map((option) => (
              <button
                key={option}
                onClick={() => setRecurring(option)}
                className={`flex-1 py-2.5 px-4 rounded-full border transition-colors ${
                  recurring === option
                    ? 'bg-primary text-white border-primary'
                    : 'bg-card border-border text-foreground hover:bg-secondary'
                }`}
                style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
              >
                {option === 'none' ? 'One-time' : option === 'weekly' ? 'Weekly' : 'Bi-weekly'}
              </button>
            ))}
          </div>
        </div>

        {/* Time Slots */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3
              className="text-foreground"
              style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}
            >
              Time Slots
            </h3>
            <button
              onClick={() => setShowAddSlot(!showAddSlot)}
              className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
              style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
            >
              <Plus className="w-4 h-4" />
              Add Slot
            </button>
          </div>

          {/* Add Slot Form */}
          {showAddSlot && (
            <div className="mb-4 p-4 bg-card border border-border rounded-xl space-y-4">
              {/* Time */}
              <div>
                <label
                  className="block mb-2 text-foreground"
                  style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
                >
                  Time
                </label>
                <input
                  type="time"
                  value={newSlotTime}
                  onChange={(e) => setNewSlotTime(e.target.value)}
                  className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                  style={{ fontSize: 'var(--text-base)' }}
                />
              </div>

              {/* Duration */}
              <div>
                <label
                  className="block mb-2 text-foreground"
                  style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
                >
                  Duration (minutes)
                </label>
                <select
                  value={newSlotDuration}
                  onChange={(e) => setNewSlotDuration(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                  style={{ fontSize: 'var(--text-base)' }}
                >
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                </select>
              </div>

              {/* Type */}
              <div>
                <label
                  className="block mb-2 text-foreground"
                  style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
                >
                  Session Type
                </label>
                <div className="flex gap-2">
                  {(['group', 'individual'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setNewSlotType(type)}
                      className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${
                        newSlotType === type
                          ? 'bg-primary/10 border-primary text-primary'
                          : 'bg-background border-border text-foreground hover:bg-secondary'
                      }`}
                      style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
                    >
                      {type === 'group' ? 'Group' : '1-on-1'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Max Students (for group only) */}
              {newSlotType === 'group' && (
                <div>
                  <label
                    className="block mb-2 text-foreground"
                    style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
                  >
                    Max Students
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="15"
                    value={newSlotMaxStudents}
                    onChange={(e) => setNewSlotMaxStudents(Number(e.target.value))}
                    className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
                    style={{ fontSize: 'var(--text-base)' }}
                  />
                </div>
              )}

              {/* Location */}
              <div>
                <label
                  className="block mb-2 text-foreground"
                  style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
                >
                  Location
                </label>
                <div className="flex gap-2">
                  {(['online', 'in-person'] as const).map((loc) => (
                    <button
                      key={loc}
                      onClick={() => setNewSlotLocation(loc)}
                      className={`flex-1 py-2 px-4 rounded-lg border transition-colors ${
                        newSlotLocation === loc
                          ? 'bg-primary/10 border-primary text-primary'
                          : 'bg-background border-border text-foreground hover:bg-secondary'
                      }`}
                      style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
                    >
                      {loc === 'online' ? 'Online' : 'In-Person'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowAddSlot(false)}
                  className="flex-1 py-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                  style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTimeSlot}
                  className="flex-1 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {/* Existing Slots */}
          {timeSlots.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                No time slots added yet
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {timeSlots.map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-foreground"
                        style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}
                      >
                        {formatTime(slot.time)}
                      </span>
                      <span className="text-muted-foreground" style={{ fontSize: 'var(--text-sm)' }}>
                        ({slot.duration} min)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${
                          slot.type === 'group'
                            ? 'bg-[#d5e2f6] dark:bg-[#d5e2f6]/20 text-primary dark:text-[#d5e2f6]'
                            : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        }`}
                      >
                        {slot.type === 'group' ? `Group (max ${slot.maxStudents})` : '1-on-1'}
                      </span>
                      <span className="text-muted-foreground" style={{ fontSize: 'var(--text-xs)' }}>
                        •
                      </span>
                      <span className="text-muted-foreground" style={{ fontSize: 'var(--text-xs)' }}>
                        {slot.location === 'online' ? 'Online' : 'In-Person'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveSlot(slot.id)}
                    className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Save Button */}
      <div className="px-4 py-4 bg-background border-t border-border flex-shrink-0">
        <button
          onClick={handleSave}
          disabled={selectedDates.length === 0 || timeSlots.length === 0}
          className="w-full py-4 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}
        >
          Save Availability
        </button>
      </div>
    </div>
  );
}