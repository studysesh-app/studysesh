import { useRef, useEffect, useState } from 'react';

interface IOSTimePickerProps {
  value: string; // 24h format "HH:MM"
  onChange: (value: string) => void;
  label?: string;
}

export function IOSTimePicker({ value, onChange, label }: IOSTimePickerProps) {
  const [hours, minutes] = value.split(':');
  const hour24 = parseInt(hours);
  const hour12 = hour24 % 12 || 12;
  const period = hour24 >= 12 ? 'PM' : 'AM';

  const hourRef = useRef<HTMLDivElement>(null);
  const minuteRef = useRef<HTMLDivElement>(null);
  const periodRef = useRef<HTMLDivElement>(null);

  const [isScrolling, setIsScrolling] = useState(false);

  const hourOptions = Array.from({ length: 12 }, (_, i) => i + 1);
  const minuteOptions = [0, 15, 30, 45]; // Only 15-minute increments
  const periodOptions = ['AM', 'PM'];

  const ITEM_HEIGHT = 44;

  // Get the index of the current minute (rounded to nearest 15)
  const getCurrentMinuteIndex = () => {
    const currentMinute = parseInt(minutes);
    const roundedMinute = Math.round(currentMinute / 15) * 15;
    return minuteOptions.indexOf(roundedMinute);
  };

  useEffect(() => {
    if (hourRef.current && !isScrolling) {
      hourRef.current.scrollTop = (hour12 - 1) * ITEM_HEIGHT;
    }
  }, [hour12, isScrolling]);

  useEffect(() => {
    if (minuteRef.current && !isScrolling) {
      minuteRef.current.scrollTop = getCurrentMinuteIndex() * ITEM_HEIGHT;
    }
  }, [minutes, isScrolling]);

  useEffect(() => {
    if (periodRef.current && !isScrolling) {
      periodRef.current.scrollTop = (period === 'PM' ? 1 : 0) * ITEM_HEIGHT;
    }
  }, [period, isScrolling]);

  const handleScroll = (type: 'hour' | 'minute' | 'period', ref: React.RefObject<HTMLDivElement>) => {
    if (!ref.current) return;
    
    setIsScrolling(true);
    
    const scrollTop = ref.current.scrollTop;
    const index = Math.round(scrollTop / ITEM_HEIGHT);
    
    // Snap to position
    ref.current.scrollTop = index * ITEM_HEIGHT;

    let newHour24 = hour24;
    let newMinute = parseInt(minutes);

    if (type === 'hour') {
      const selectedHour = hourOptions[index];
      newHour24 = period === 'PM' && selectedHour !== 12 ? selectedHour + 12 : selectedHour === 12 && period === 'AM' ? 0 : selectedHour;
    } else if (type === 'minute') {
      newMinute = minuteOptions[index];
    } else if (type === 'period') {
      const selectedPeriod = periodOptions[index];
      if (selectedPeriod === 'PM' && period === 'AM') {
        newHour24 = hour24 + 12;
      } else if (selectedPeriod === 'AM' && period === 'PM') {
        newHour24 = hour24 - 12;
      }
    }

    const formattedHour = String(newHour24).padStart(2, '0');
    const formattedMinute = String(newMinute).padStart(2, '0');
    onChange(`${formattedHour}:${formattedMinute}`);

    setTimeout(() => setIsScrolling(false), 100);
  };

  const getItemStyle = (index: number, scrollTop: number, currentValue: number) => {
    const itemTop = index * ITEM_HEIGHT;
    const distance = Math.abs(scrollTop - itemTop);
    const maxDistance = ITEM_HEIGHT * 2;
    const normalizedDistance = Math.min(distance / maxDistance, 1);
    
    const opacity = 1 - normalizedDistance * 0.7;
    const scale = 1 - normalizedDistance * 0.3;
    
    return {
      opacity,
      transform: `scale(${scale})`,
      transition: 'opacity 0.15s, transform 0.15s',
    };
  };

  const PickerColumn = ({
    options,
    selectedIndex,
    onScroll,
    ref,
    format,
  }: {
    options: (string | number)[];
    selectedIndex: number;
    onScroll: () => void;
    ref: React.RefObject<HTMLDivElement>;
    format?: (val: string | number) => string;
  }) => {
    const [scrollTop, setScrollTop] = useState(0);

    return (
      <div className="relative flex-1 h-full overflow-hidden">
        {/* Selection indicator */}
        <div
          className="absolute left-0 right-0 pointer-events-none z-10"
          style={{
            top: `calc(50% - ${ITEM_HEIGHT / 2}px)`,
            height: ITEM_HEIGHT,
            borderTop: '1px solid light-dark(rgba(0, 0, 0, 0.1), rgba(255, 255, 255, 0.1))',
            borderBottom: '1px solid light-dark(rgba(0, 0, 0, 0.1), rgba(255, 255, 255, 0.1))',
          }}
        />

        {/* Gradient overlays */}
        <div
          className="absolute left-0 right-0 top-0 pointer-events-none z-10"
          style={{
            height: ITEM_HEIGHT * 2,
            background: 'linear-gradient(to bottom, light-dark(rgba(255, 255, 255, 1), rgba(26, 26, 26, 1)) 0%, light-dark(rgba(255, 255, 255, 0), rgba(26, 26, 26, 0)) 100%)',
          }}
        />
        <div
          className="absolute left-0 right-0 bottom-0 pointer-events-none z-10"
          style={{
            height: ITEM_HEIGHT * 2,
            background: 'linear-gradient(to top, light-dark(rgba(255, 255, 255, 1), rgba(26, 26, 26, 1)) 0%, light-dark(rgba(255, 255, 255, 0), rgba(26, 26, 26, 0)) 100%)',
          }}
        />

        {/* Scrollable list */}
        <div
          ref={ref}
          className="h-full overflow-y-scroll scrollbar-hide"
          style={{
            scrollSnapType: 'y mandatory',
            paddingTop: ITEM_HEIGHT * 2,
            paddingBottom: ITEM_HEIGHT * 2,
          }}
          onScroll={(e) => {
            setScrollTop(e.currentTarget.scrollTop);
            onScroll();
          }}
        >
          {options.map((option, index) => (
            <div
              key={index}
              className="flex items-center justify-center"
              style={{
                height: ITEM_HEIGHT,
                scrollSnapAlign: 'center',
                fontSize: 'var(--text-xl)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--text-foreground)',
                ...getItemStyle(index, scrollTop, selectedIndex),
              }}
            >
              {format ? format(option) : option}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      {label && (
        <label
          className="block mb-2 text-foreground"
          style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}
        >
          {label}
        </label>
      )}
      <div
        className="flex gap-2 rounded-xl overflow-hidden"
        style={{
          height: ITEM_HEIGHT * 5,
          background: 'light-dark(#f5f5f5, #2a2a2a)',
        }}
      >
        {/* Hours */}
        <PickerColumn
          ref={hourRef}
          options={hourOptions}
          selectedIndex={hour12 - 1}
          onScroll={() => handleScroll('hour', hourRef)}
        />

        {/* Minutes */}
        <PickerColumn
          ref={minuteRef}
          options={minuteOptions}
          selectedIndex={getCurrentMinuteIndex()}
          onScroll={() => handleScroll('minute', minuteRef)}
          format={(val) => String(val).padStart(2, '0')}
        />

        {/* Period */}
        <PickerColumn
          ref={periodRef}
          options={periodOptions}
          selectedIndex={period === 'PM' ? 1 : 0}
          onScroll={() => handleScroll('period', periodRef)}
        />
      </div>
    </div>
  );
}