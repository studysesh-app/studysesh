import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SlidersHorizontal, Users, DollarSign, MapPin, ChevronRight } from 'lucide-react';

interface SubOption {
  id: string;
  label: string;
}

interface FilterOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  subOptions?: SubOption[];
}

interface FilterDropdownItemProps {
  option: FilterOption;
  index: number;
  isHeader: boolean;
  optionsLength: number;
  isExpanded: boolean;
  onPress: () => void;
  itemHeight: number;
  maxDropDownHeight: number;
  isSelected?: boolean;
  isParentSelected?: boolean;
}

function FilterDropdownItem({
  option,
  index,
  isHeader,
  optionsLength,
  isExpanded,
  onPress,
  itemHeight,
  maxDropDownHeight,
  isSelected = false,
  isParentSelected = false,
}: FilterDropdownItemProps) {
  // Calculate stacking positions
  const collapsedBottom = index * 12;
  const expandedBottom = maxDropDownHeight / 2 - index * (itemHeight + 8);
  
  // Calculate scale for stacking effect
  const collapsedScale = 1 - index * 0.04;
  const expandedScale = 1;
  
  // Background lightness gradient
  const lighten = 1 - (optionsLength - index) / optionsLength;
  const collapsedLightness = 95 - lighten * 8;
  const expandedLightness = 97;

  // Determine background color and border
  const getBackgroundColor = () => {
    if (isSelected && !isHeader) {
      return 'hsl(0, 79%, 87%)'; // Darker red for selected sub-option
    }
    if (isParentSelected && !isHeader) {
      return 'hsl(0, 79%, 95%)'; // Lighter red for parent category with selections
    }
    if (isExpanded) {
      return `hsl(0, 0%, ${expandedLightness}%)`;
    }
    return `hsl(0, 0%, ${collapsedLightness}%)`;
  };

  const getBorderColor = () => {
    if (isSelected && !isHeader) {
      return 'border-primary';
    }
    if (isParentSelected && !isHeader) {
      return 'border-primary/30';
    }
    return 'border-border';
  };

  return (
    <motion.div
      className={`absolute w-full rounded-2xl shadow-md border overflow-hidden cursor-pointer bg-card ${getBorderColor()}`}
      style={{
        zIndex: optionsLength - index,
      }}
      initial={false}
      animate={{
        bottom: isExpanded ? expandedBottom : collapsedBottom,
        scale: isExpanded ? expandedScale : collapsedScale,
        backgroundColor: getBackgroundColor(),
      }}
      transition={{
        type: 'spring',
        damping: 30,
        stiffness: 300,
        mass: 0.8,
      }}
      onClick={onPress}
      whileTap={{ scale: (isExpanded ? expandedScale : collapsedScale) * 0.97 }}
    >
      <div className="flex items-center p-4 gap-3">
        {/* Icon */}
        <motion.div 
          className={`flex items-center justify-center w-10 h-10 rounded-xl flex-shrink-0 ${
            isSelected && !isHeader ? 'bg-primary/20' : 'bg-secondary/80'
          }`}
          initial={false}
          animate={{
            opacity: isHeader ? 1 : (isExpanded ? 1 : 0),
            scale: isHeader ? 1 : (isExpanded ? 1 : 0.8),
          }}
          transition={{
            duration: 0.2,
            delay: isExpanded && !isHeader ? index * 0.03 : 0,
          }}
        >
          {option.icon}
        </motion.div>

        {/* Label */}
        <motion.span
          initial={false}
          animate={{
            opacity: isHeader ? 1 : (isExpanded ? 1 : 0),
            x: isHeader ? 0 : (isExpanded ? 0 : -10),
          }}
          transition={{
            duration: 0.25,
            delay: isExpanded && !isHeader ? index * 0.03 : 0,
            ease: [0.4, 0, 0.2, 1],
          }}
          style={{ 
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--font-weight-medium)',
            color: isSelected && !isHeader ? '#db2321' : undefined,
          }}
          className="flex-1 uppercase tracking-wide"
        >
          {option.label}
        </motion.span>

        {/* Arrow */}
        {(isHeader || option.subOptions) && (
          <motion.div
            initial={false}
            animate={{
              rotate: isHeader && isExpanded ? 90 : 0,
              opacity: isHeader ? 1 : (isExpanded ? 1 : 0),
            }}
            transition={{
              type: 'spring',
              damping: 20,
              stiffness: 300,
            }}
            className="flex items-center justify-center flex-shrink-0"
          >
            <ChevronRight className={`w-5 h-5 ${isSelected && !isHeader ? 'text-primary' : 'text-muted-foreground'}`} />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

interface FilterDropdownProps {
  onSelect?: (filterId: string, optionId: string) => void;
  selectedFilters?: Record<string, string[]>;
  onRequestClose?: () => void;
}

const ITEM_HEIGHT = 64;

export function FilterDropdown({ onSelect, selectedFilters = {} }: FilterDropdownProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterOption | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const filterOptions: FilterOption[] = [
    {
      id: 'session-type',
      label: 'Session Type',
      icon: <Users className="w-5 h-5 text-primary" />,
      subOptions: [
        { id: '1-on-1', label: '1:1' },
        { id: 'group', label: 'Group' },
        { id: 'both', label: 'Both' },
      ],
    },
    {
      id: 'price-range',
      label: 'Price Range',
      icon: <DollarSign className="w-5 h-5 text-primary" />,
      subOptions: [
        { id: 'free-10', label: 'Free - $10' },
        { id: '10-20', label: '$10 - $20' },
        { id: '20-30', label: '$20 - $30' },
      ],
    },
    {
      id: 'location',
      label: 'Location',
      icon: <MapPin className="w-5 h-5 text-primary" />,
      subOptions: [
        { id: 'online', label: 'Online' },
        { id: 'in-person', label: 'In-Person' },
        { id: 'both', label: 'Both' },
      ],
    },
  ];

  const headerOption: FilterOption = {
    id: 'filters',
    label: 'Filters',
    icon: <SlidersHorizontal className="w-5 h-5 text-primary" />,
  };

  // Determine what to display
  const displayOptions = activeFilter 
    ? [activeFilter, ...(activeFilter.subOptions?.map(sub => ({
        id: sub.id,
        label: sub.label,
        icon: <div className="w-5 h-5" />,
      })) || [])]
    : [headerOption, ...filterOptions];

  const optionsLength = displayOptions.length - 1;
  const maxDropDownHeight = (ITEM_HEIGHT + 8) * optionsLength;

  const handleItemPress = useCallback((option: FilterOption, index: number) => {
    if (index === 0) {
      // Header clicked
      if (activeFilter) {
        // Go back to main menu - with transition
        setIsTransitioning(true);
        setTimeout(() => {
          setActiveFilter(null);
          setIsTransitioning(false);
        }, 150);
      } else {
        // Toggle expansion
        setIsExpanded(!isExpanded);
      }
    } else if (option.subOptions && !activeFilter) {
      // Main filter option clicked - show sub-options with transition
      setIsTransitioning(true);
      setTimeout(() => {
        setActiveFilter(option);
        setIsTransitioning(false);
      }, 150);
    } else if (activeFilter) {
      // Sub-option clicked - toggle selection (don't close dropdown)
      onSelect?.(activeFilter.id, option.id);
    }
  }, [isExpanded, activeFilter, onSelect]);

  // Check if an option is selected
  const isOptionSelected = (filterId: string, optionId: string) => {
    return selectedFilters[filterId]?.includes(optionId) || false;
  };

  return (
    <motion.div
      className="relative w-full"
      style={{
        height: maxDropDownHeight + ITEM_HEIGHT,
      }}
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{
        duration: 0.2,
        ease: [0.4, 0, 0.2, 1],
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={activeFilter ? activeFilter.id : 'main'}
          initial={{ opacity: 0 }}
          animate={{ opacity: isTransitioning ? 0 : 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="relative w-full h-full"
        >
          {displayOptions.map((option, index) => {
            const isSelected = activeFilter && index > 0
              ? isOptionSelected(activeFilter.id, option.id)
              : false;
            
            // Check if this category header has any active filters
            const hasActiveFilters = !activeFilter && index > 0 && selectedFilters[option.id]?.length > 0;

            return (
              <FilterDropdownItem
                key={`${option.id}-${index}`}
                option={option}
                index={index}
                isHeader={index === 0}
                optionsLength={optionsLength}
                isExpanded={isExpanded}
                onPress={() => handleItemPress(option, index)}
                itemHeight={ITEM_HEIGHT}
                maxDropDownHeight={maxDropDownHeight}
                isSelected={isSelected}
                isParentSelected={hasActiveFilters}
              />
            );
          })}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}