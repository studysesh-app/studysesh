import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface CalendarPickerProps {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  onSelectDate?: (date: Date) => void; // Backwards compatibility
  availableDates?: Date[];
  selectedDates?: Date[]; // For multi-select mode
  multiSelect?: boolean;
}

// Helper function to normalize dates to midnight
const normalizeDate = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

// Helper function to check if two dates are the same day
const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};

export function CalendarPicker({ 
  selectedDate, 
  onDateSelect, 
  onSelectDate, 
  availableDates = [],
  selectedDates = [],
  multiSelect = false 
}: CalendarPickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const handleDateSelect = (date: Date) => {
    if (onDateSelect) {
      onDateSelect(date);
    } else if (onSelectDate) {
      onSelectDate(date);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const isDateAvailable = (date: Date) => {
    if (availableDates.length === 0) return true;
    return availableDates.some(
      (availableDate) =>
        availableDate.getDate() === date.getDate() &&
        availableDate.getMonth() === date.getMonth() &&
        availableDate.getFullYear() === date.getFullYear()
    );
  };

  const isDateSelected = (date: Date) => {
    if (multiSelect && selectedDates.length > 0) {
      // Use the SAME comparison method as the parent components
      const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      return selectedDates.some((d) => {
        const dKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        return dKey === dateKey;
      });
    }
    if (!selectedDate) return false;
    // For single select, also use string comparison
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    const selectedKey = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`;
    return dateKey === selectedKey;
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div 
      className="rounded-2xl p-4"
      style={{
        background: 'light-dark(linear-gradient(145deg, rgba(255, 255, 255, 1) 0%, rgba(248, 248, 248, 1) 100%), linear-gradient(145deg, rgba(30, 30, 30, 1) 0%, rgba(20, 20, 20, 1) 100%))',
        boxShadow: 'light-dark(0 4px 12px rgba(0, 0, 0, 0.08), inset 1px 1px 2px rgba(255, 255, 255, 0.9), inset -1px -1px 2px rgba(0, 0, 0, 0.05), 0 4px 12px rgba(0, 0, 0, 0.5), inset 1px 1px 2px rgba(50, 50, 50, 0.5), inset -1px -1px 2px rgba(0, 0, 0, 0.3))',
        border: '1px solid light-dark(rgba(230, 230, 230, 0.8), rgba(50, 50, 50, 0.8))',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousMonth}
          className="p-2 rounded-lg transition-all hover:brightness-105 active:scale-95 text-foreground"
          style={{
            background: 'light-dark(linear-gradient(145deg, rgba(250, 250, 250, 1) 0%, rgba(240, 240, 240, 1) 100%), linear-gradient(145deg, rgba(35, 35, 35, 1) 0%, rgba(25, 25, 25, 1) 100%))',
            boxShadow: 'light-dark(inset 1px 1px 2px rgba(0, 0, 0, 0.08), inset -1px -1px 2px rgba(255, 255, 255, 0.9), inset 1px 1px 2px rgba(0, 0, 0, 0.4), inset -1px -1px 2px rgba(50, 50, 50, 0.3))',
            border: '1px solid light-dark(rgba(230, 230, 230, 0.5), rgba(50, 50, 50, 0.5))',
          }}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
          {monthName}
        </h3>
        <button
          onClick={goToNextMonth}
          className="p-2 rounded-lg transition-all hover:brightness-105 active:scale-95 text-foreground"
          style={{
            background: 'light-dark(linear-gradient(145deg, rgba(250, 250, 250, 1) 0%, rgba(240, 240, 240, 1) 100%), linear-gradient(145deg, rgba(35, 35, 35, 1) 0%, rgba(25, 25, 25, 1) 100%))',
            boxShadow: 'light-dark(inset 1px 1px 2px rgba(0, 0, 0, 0.08), inset -1px -1px 2px rgba(255, 255, 255, 0.9), inset 1px 1px 2px rgba(0, 0, 0, 0.4), inset -1px -1px 2px rgba(50, 50, 50, 0.3))',
            border: '1px solid light-dark(rgba(230, 230, 230, 0.5), rgba(50, 50, 50, 0.5))',
          }}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
          <div
            key={index}
            className="text-center text-muted-foreground py-2"
            style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startingDayOfWeek }).map((_, index) => (
          <div key={`empty-${index}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
          const available = isDateAvailable(date);
          const selected = isDateSelected(date);

          const getButtonStyle = () => {
            if (selected) {
              return {
                background: 'linear-gradient(180deg, #db2321 0%, #a01a18 100%)',
                boxShadow: '0 4px 12px rgba(219, 35, 33, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.3), inset 0 -2px 4px rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(160, 26, 24, 0.5)',
                color: 'white',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
              };
            }
            if (available) {
              return {
                background: 'light-dark(linear-gradient(145deg, rgba(250, 250, 250, 1) 0%, rgba(240, 240, 240, 1) 100%), linear-gradient(145deg, rgba(45, 45, 45, 1) 0%, rgba(35, 35, 35, 1) 100%))',
                boxShadow: 'light-dark(inset 1px 1px 2px rgba(0, 0, 0, 0.05), inset -1px -1px 2px rgba(255, 255, 255, 0.9), inset 1px 1px 2px rgba(0, 0, 0, 0.4), inset -1px -1px 2px rgba(60, 60, 60, 0.5))',
                border: '1px solid light-dark(rgba(235, 235, 235, 0.5), rgba(60, 60, 60, 0.5))',
                color: 'light-dark(var(--foreground), rgba(220, 220, 220, 1))',
              };
            }
            return {
              color: 'light-dark(rgba(150, 150, 150, 0.3), rgba(80, 80, 80, 0.5))',
            };
          };

          return (
            <button
              key={day}
              onClick={() => available && handleDateSelect(date)}
              disabled={!available}
              className={`
                aspect-square rounded-full transition-all duration-200 flex items-center justify-center
                ${selected ? 'scale-105' : ''}
                ${!selected && available ? 'hover:brightness-105 hover:scale-105' : ''}
                ${!available ? 'cursor-not-allowed' : ''}
              `}
              style={{ 
                ...getButtonStyle(),
                fontSize: 'var(--text-sm)', 
                fontWeight: selected ? 'var(--font-weight-semibold)' : 'var(--font-weight-normal)' 
              }}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}