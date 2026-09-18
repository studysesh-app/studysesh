import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { useState, useCallback, useEffect, useRef } from 'react';
import { SlidersHorizontal, Users, DollarSign, MapPin, ChevronRight } from 'lucide-react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    interpolate,
    Extrapolation,
    runOnJS,
    SharedValue,
} from 'react-native-reanimated';

interface SubOption {
    id: string;
    label: string;
}

interface FilterOption {
    id: string;
    label: string;
    iconName: 'users' | 'dollar-sign' | 'map-pin';
    subOptions: SubOption[];
}

interface FilterDropdownProps {
    onSelect?: (filterId: string, optionId: string) => void;
    selectedFilters?: Record<string, string[]>;
    onClose?: () => void;
    visible?: boolean;
}

const ITEM_HEIGHT = 60;
const ITEM_PADDING = 8;
const SPRING_CONFIG = {
    damping: 35, // Original damping
    stiffness: 350, // Original stiffness
    mass: 0.8,
    overshootClamping: false, // Allow overshoot for bounce effect
};
// Peek offset for collapsed state - cards stack with small vertical offsets
const PEEK_OFFSET = 10;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function FilterDropdownItem({
    option,
    isHeader,
    index,
    totalItems,
    progress,
    onPress,
    selectedFilters,
    activeFilterId,
    isTransitioning,
    headerLabel,
    filterOptions,
    subMenuProgress,
    maxDropDownHeight,
}: {
    option: FilterOption | { id: 'header'; label: string; iconName: 'sliders-horizontal' };
    isHeader: boolean;
    index: number;
    totalItems: number;
    progress: SharedValue<number>;
    onPress: (option: any) => void;
    selectedFilters?: Record<string, string[]>;
    activeFilterId: string | null;
    isTransitioning: boolean;
    headerLabel: string;
    filterOptions: FilterOption[];
    subMenuProgress: SharedValue<number>;
    maxDropDownHeight: number;
}) {
    const handlePress = useCallback(() => {
        if (isTransitioning) return;
        onPress(option);
    }, [option, onPress, isTransitioning]);

    // Calculate background color with progressive darkening (95% to 87% lightness)
    const lightnessFactor = 1 - (totalItems - index) / totalItems;
    const lightness = 95 - (lightnessFactor * 8); // 95% to 87%
    const collapsedBg = `hsl(0, 0%, ${lightness}%)`;
    const expandedBg = '#ffffff';

    // Check if this category has selections (for parent category highlight)
    // Only check when in main menu (not sub-menu) and not header
    // Make sure to check if the array exists and has length > 0 AND has at least one non-empty value
    const categoryFilters = selectedFilters?.[option.id];
    const hasSelections = !isHeader && !activeFilterId && categoryFilters && categoryFilters.some(f => f !== '');

    const rItemStyle = useAnimatedStyle(() => {
        const isSubMenu = activeFilterId !== null;

        // In sub-menu, only show header and active filter
        if (isSubMenu && !isHeader && option.id !== activeFilterId) {
            return {
                position: 'absolute',
                opacity: 0,
                zIndex: 0,
            };
        }

        // Bottom position: deck of cards stacking effect
        let bottom: number;
        if (isSubMenu) {
            // Sub-menu positioning (not part of deck of cards effect)
            if (isHeader) {
                bottom = maxDropDownHeight;
            } else {
                bottom = maxDropDownHeight - (ITEM_HEIGHT + ITEM_PADDING);
            }
        } else {
            // Deck of Cards Logic - using bottom positioning
            // Collapsed: Cards stack with small peek offsets, centered higher on screen
            // Add offset to shift collapsed cards up (more centered)
            const COLLAPSED_OFFSET = 150; // Shift collapsed cards up by this amount
            const collapsedBottom = COLLAPSED_OFFSET + (index * PEEK_OFFSET);
            
            // Expanded: Cards spread out with equal spacing (keep original position)
            // Calculate total height needed for all cards
            const totalExpandedHeight = (totalItems - 1) * (ITEM_HEIGHT + ITEM_PADDING);
            // Header stays at bottom (0), others stack above with spacing
            const expandedBottom = (totalItems - 1 - index) * (ITEM_HEIGHT + ITEM_PADDING);
            
            bottom = interpolate(
                progress.value,
                [0, 1],
                [collapsedBottom, expandedBottom],
                Extrapolation.CLAMP
            );
        }

        // Scale: 4% reduction per level when collapsed (creates depth perspective)
        const scale = interpolate(
            progress.value,
            [0, 1],
            [1 - index * 0.04, 1],
            Extrapolation.CLAMP
        );

        // Background color transition
        let backgroundColor = progress.value < 0.5 ? collapsedBg : expandedBg;
        let borderColor = '#e5e7eb';

        // Parent category indicator: light red tint if has selections (only when expanded and not in sub-menu)
        if (!isHeader && hasSelections && !isSubMenu && progress.value > 0.5) {
            backgroundColor = 'hsl(0, 79%, 95%)';
            borderColor = 'rgba(219, 35, 33, 0.3)';
        }

        // Opacity for fade transitions
        let opacity: number;
        if (isSubMenu) {
            if (isHeader) {
                opacity = 1; // Header always visible
            } else if (option.id === activeFilterId) {
                opacity = subMenuProgress.value; // Fade in with sub-menu progress
            } else {
                opacity = 0; // Others hidden
            }
        } else {
            // Main menu: fade out when transitioning to sub-menu
            if (isHeader) {
                // Header stays visible but fades slightly during transition
                opacity = interpolate(
                    progress.value,
                    [0, 0.5, 1],
                    [1, 0.3, 1], // Fade out when progress goes to 0.5 (sub-menu transition)
                    Extrapolation.CLAMP
                );
            } else {
                // Cards behind header: visible when collapsed (for peek), fade out during sub-menu transition
                opacity = interpolate(
                    progress.value,
                    [0, 0.5, 1],
                    [0.7, 0, 1], // Visible when collapsed, fade out during transition, visible when expanded
                    Extrapolation.CLAMP
                );
            }
        }

        return {
            position: 'absolute',
            bottom,
            backgroundColor,
            borderColor,
            opacity,
            zIndex: totalItems - index, // Header (index 0) has highest z-index
            transform: [{ scale }],
        };
    }, [index, totalItems, activeFilterId, hasSelections, collapsedBg, expandedBg, subMenuProgress, selectedFilters, option.id]);

    const rContentStyle = useAnimatedStyle(() => {
        // Content opacity: header always visible, others fade in with progress
        const opacity = interpolate(
            progress.value,
            [0, 1],
            [isHeader ? 1 : 0, 1],
            Extrapolation.CLAMP
        );

        // Label slide and fade (only for non-header items)
        const labelTranslateX = isHeader ? 0 : interpolate(
            progress.value,
            [0, 1],
            [10, 0],
            Extrapolation.CLAMP
        );

        return {
            opacity,
            transform: [
                { translateX: labelTranslateX },
            ],
        };
    }, [index, isHeader]);

    const rIconStyle = useAnimatedStyle(() => {
        // Icon scale and fade - header icon always visible
        const scale = interpolate(
            progress.value,
            [0, 1],
            [isHeader ? 1 : 0.8, 1],
            Extrapolation.CLAMP
        );
        const opacity = interpolate(
            progress.value,
            [0, 1],
            [isHeader ? 1 : 0, 1],
            Extrapolation.CLAMP
        );

        return {
            transform: [{ scale }],
            opacity,
        };
    }, [isHeader]);

    const rChevronStyle = useAnimatedStyle(() => {
        // Rotate 90 degrees when expanded, 0 when collapsed
        // In sub-menu, rotate back to 0
        const rotation = activeFilterId
            ? 0
            : interpolate(
                progress.value,
                [0, 1],
                [0, Math.PI / 2], // 90 degrees
                Extrapolation.CLAMP
            );
        return {
            transform: [{ rotate: `${rotation}rad` }],
        };
    }, [activeFilterId]);



    const getIcon = () => {
        if (isHeader) {
            // In sub-menu, show the active filter's icon; otherwise show filters icon
            if (activeFilterId) {
                const activeOption = filterOptions.find(f => f.id === activeFilterId);
                if (activeOption) {
                    const iconMap = {
                        'users': Users,
                        'dollar-sign': DollarSign,
                        'map-pin': MapPin,
                    };
                    const Icon = iconMap[activeOption.iconName];
                    return <Icon size={18} color="#db2321" />;
                }
            }
            return <SlidersHorizontal size={18} color="#db2321" />;
        }
        const iconMap = {
            'users': Users,
            'dollar-sign': DollarSign,
            'map-pin': MapPin,
        };
        const Icon = iconMap[option.iconName as keyof typeof iconMap];
        return <Icon size={18} color={hasSelections ? '#db2321' : '#6b7280'} />;
    };

    return (
        <AnimatedPressable
            onPress={handlePress}
            style={[styles.item, { height: ITEM_HEIGHT }, rItemStyle]}
        >
            <Animated.View style={[styles.content, rContentStyle]}>
                <Animated.View style={[styles.iconBox, !isHeader && rIconStyle, hasSelections && styles.iconBoxSelected]}>
                    {getIcon()}
                </Animated.View>
                <Text style={[styles.title, hasSelections && styles.titleSelected]}>
                    {isHeader ? headerLabel.toUpperCase() : option.label.toUpperCase()}
                </Text>
                <View style={{ flex: 1 }} />
                {isHeader && (
                    <Animated.View style={[styles.arrowBox, rChevronStyle]}>
                        <ChevronRight
                            size={18}
                            color={activeFilterId ? "#db2321" : "rgba(107, 114, 128, 0.8)"}
                        />
                    </Animated.View>
                )}
            </Animated.View>
        </AnimatedPressable>
    );
}

function SubOptionItem({
    option,
    filterId,
    isSelected,
    onPress,
    index,
    progress,
    isTransitioning,
    bottomPosition,
}: {
    option: SubOption;
    filterId: string;
    isSelected: boolean;
    onPress: (filterId: string, optionId: string) => void;
    index: number;
    progress: SharedValue<number>;
    isTransitioning: boolean;
    bottomPosition: number;
}) {
    const pressScale = useSharedValue(1);
    
    const handlePress = useCallback(() => {
        if (isTransitioning) return;
        onPress(filterId, option.id);
    }, [filterId, option.id, onPress, isTransitioning]);
    
    const handlePressIn = useCallback(() => {
        pressScale.value = withSpring(0.95, SPRING_CONFIG);
    }, [pressScale]);
    
    const handlePressOut = useCallback(() => {
        pressScale.value = withSpring(1, SPRING_CONFIG);
    }, [pressScale]);

    const rStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            progress.value,
            [0, 1],
            [0, 1],
            Extrapolation.CLAMP
        );
        const translateY = interpolate(
            progress.value,
            [0, 1],
            [10, 0],
            Extrapolation.CLAMP
        );
        const scale = interpolate(
            progress.value,
            [0, 1],
            [0.95, 1],
            Extrapolation.CLAMP
        );
        
        return {
            position: 'absolute',
            bottom: bottomPosition,
            opacity,
            zIndex: 100 - index,
            transform: [{ translateY }, { scale: scale * pressScale.value }],
        };
    }, [bottomPosition, index, progress, pressScale]);
    
    return (
        <AnimatedPressable
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[styles.subItem, rStyle, isSelected && styles.subItemSelected]}
        >
            <Animated.Text 
                style={[styles.subItemText, isSelected && styles.subItemTextSelected]}
            >
                {option.label}
            </Animated.Text>
        </AnimatedPressable>
    );
}

export function FilterDropdown({ onSelect, selectedFilters = {}, onClose, visible = true }: FilterDropdownProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeFilterId, setActiveFilterId] = useState<string | null>(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const containerRef = useRef<View>(null);

    const progress = useSharedValue(0);
    const subMenuProgress = useSharedValue(0);
    const overlayOpacity = useSharedValue(0);
    const dropdownOpacity = useSharedValue(0);
    const dropdownScale = useSharedValue(0.95);

    const filterOptions: FilterOption[] = [
        {
            id: 'session-type',
            label: 'Session Type',
            iconName: 'users',
            subOptions: [
                { id: '1-on-1', label: '1:1' },
                { id: 'group', label: 'Group' },
                { id: 'both', label: 'Both' },
            ],
        },
        {
            id: 'price-range',
            label: 'Price Range',
            iconName: 'dollar-sign',
            subOptions: [
                { id: 'free-10', label: 'Free - $10' },
                { id: '10-20', label: '$10 - $20' },
                { id: '20-30', label: '$20 - $30' },
            ],
        },
        {
            id: 'location',
            label: 'Location',
            iconName: 'map-pin',
            subOptions: [
                { id: 'online', label: 'Online' },
                { id: 'in-person', label: 'In-Person' },
                { id: 'both', label: 'Both' },
            ],
        },
    ];

    const headerOption = { id: 'header' as const, label: 'Filters', iconName: 'sliders-horizontal' as const };
    const allOptions = [headerOption, ...filterOptions];
    
    // Calculate maxDropDownHeight at component level for use in sub-options
    const optionsCount = allOptions.length - 1; // Excluding header
    const maxDropDownHeight = optionsCount * (ITEM_HEIGHT + ITEM_PADDING);

    // Animate overlay and dropdown on mount/unmount
    useEffect(() => {
        if (visible) {
            overlayOpacity.value = withTiming(1, { duration: 200 });
            dropdownOpacity.value = withTiming(1, { duration: 200 });
            dropdownScale.value = withSpring(1, SPRING_CONFIG);
            // Start collapsed - don't auto-expand
            setIsExpanded(false);
            progress.value = 0;
        } else {
            overlayOpacity.value = withTiming(0, { duration: 200 });
            dropdownOpacity.value = withTiming(0, { duration: 200 });
            dropdownScale.value = withSpring(0.95, SPRING_CONFIG);
            setIsExpanded(false);
            setActiveFilterId(null);
            progress.value = withSpring(0, SPRING_CONFIG);
            subMenuProgress.value = 0;
        }
    }, [visible, overlayOpacity, dropdownOpacity, dropdownScale, progress, subMenuProgress]);

    // Handle expand/collapse
    const toggleExpanded = useCallback(() => {
        if (isTransitioning) return;

        if (activeFilterId) {
            // If in sub-menu, go back to main menu with fade
            setIsTransitioning(true);
            const wasExpanded = isExpanded;
            // First fade out sub-menu
            subMenuProgress.value = withTiming(0, { duration: 150 }, () => {
                runOnJS(setActiveFilterId)(null);
                // Fade in main menu
                if (wasExpanded) {
                    progress.value = withTiming(1, { duration: 150 }, () => {
                        runOnJS(setIsTransitioning)(false);
                    });
                } else {
                    runOnJS(setIsTransitioning)(false);
                }
            });
            return;
        }

        // Toggle expand/collapse - DO NOT close modal, just collapse/expand
        const newExpanded = !isExpanded;
        setIsExpanded(newExpanded);
        progress.value = withSpring(newExpanded ? 1 : 0, SPRING_CONFIG);
    }, [isExpanded, activeFilterId, isTransitioning, progress, subMenuProgress]);

    // Handle filter category selection
    const handleFilterSelect = useCallback((option: any) => {
        if (isTransitioning) return;

        if (option.id === 'header') {
            toggleExpanded();
            return;
        }

        // Enter sub-menu with smooth fade transition
        setIsTransitioning(true);
        // First fade out main menu items, then fade in sub-menu
        progress.value = withTiming(0.5, { duration: 150 }, () => {
            runOnJS(setActiveFilterId)(option.id);
            // Fade in sub-menu
            subMenuProgress.value = withTiming(1, { duration: 150 }, () => {
                runOnJS(setIsTransitioning)(false);
            });
        });
    }, [isTransitioning, toggleExpanded, subMenuProgress, progress]);

    // Handle sub-option selection (single select per category)
    const handleSubOptionSelect = useCallback((filterId: string, optionId: string) => {
        if (isTransitioning) return;

        const currentSelection = selectedFilters[filterId] || [];
        const isCurrentlySelected = currentSelection.includes(optionId);

        // Single select: toggle - if already selected, deselect; otherwise, select (replacing any previous selection)
        if (isCurrentlySelected) {
            // Deselect
            onSelect?.(filterId, '');
        } else {
            // Select (this will replace any existing selection in the parent)
            onSelect?.(filterId, optionId);
        }
    }, [isTransitioning, selectedFilters, onSelect]);

    // Click outside to close
    useEffect(() => {
        if (!isExpanded) return;

        const handlePressOutside = (event: any) => {
            // This would need a proper implementation with onStartShouldSetResponder
            // For now, we'll handle it via the header toggle
        };

        return () => { };
    }, [isExpanded]);

    const maxHeight = (filterOptions.length + 1) * (ITEM_HEIGHT + ITEM_PADDING);
    const currentSubOptions = activeFilterId
        ? filterOptions.find(f => f.id === activeFilterId)?.subOptions || []
        : [];

    // Determine header label
    const headerLabel = activeFilterId
        ? filterOptions.find(f => f.id === activeFilterId)?.label || 'Filters'
        : 'Filters';

    const rOverlayStyle = useAnimatedStyle(() => {
        return {
            opacity: overlayOpacity.value,
        };
    });

    const rDropdownStyle = useAnimatedStyle(() => {
        return {
            opacity: dropdownOpacity.value,
            transform: [{ scale: dropdownScale.value }],
        };
    });

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="none"
            onRequestClose={toggleExpanded}
            statusBarTranslucent={true}
        >
            <View style={styles.modalWrapper}>
                {/* Backdrop */}
                <AnimatedPressable
                    style={[styles.overlay, rOverlayStyle]}
                    onPress={() => {
                        // Close modal when clicking outside
                        overlayOpacity.value = withTiming(0, { duration: 200 });
                        dropdownOpacity.value = withTiming(0, { duration: 200 }, () => {
                            if (onClose) {
                                runOnJS(onClose)();
                            }
                        });
                    }}
                />

                {/* Dropdown Container */}
                <Animated.View style={[styles.modalContainer, rDropdownStyle]} pointerEvents="box-none">
                    <View ref={containerRef} style={styles.container}>
                        {allOptions.map((option, index) => {
                            // In sub-menu, only show header (which acts as title/back)
                            // Hide all other items, including the active category item, to prevent duplicates
                            if (activeFilterId && index > 0) {
                                return null;
                            }

                            return (
                                <FilterDropdownItem
                                    key={option.id}
                                    option={option}
                                    isHeader={index === 0}
                                    index={index}
                                    totalItems={allOptions.length}
                                    progress={progress}
                                    onPress={handleFilterSelect}
                                    selectedFilters={selectedFilters}
                                    activeFilterId={activeFilterId}
                                    isTransitioning={isTransitioning}
                                    headerLabel={headerLabel}
                                    filterOptions={filterOptions}
                                    subMenuProgress={subMenuProgress}
                                    maxDropDownHeight={maxDropDownHeight}
                                />
                            );
                        })}

                        {/* Sub-options */}
                        {activeFilterId && currentSubOptions.map((subOption, index) => {
                            const isSelected = selectedFilters[activeFilterId]?.includes(subOption.id) || false;
                            // Sub-options appear below the header
                            // Calculate bottom position: header is at maxDropDownHeight, sub-options stack above
                            const bottomPosition = maxDropDownHeight - (index + 1) * (ITEM_HEIGHT + ITEM_PADDING);
                            return (
                                <SubOptionItem
                                    key={subOption.id}
                                    option={subOption}
                                    filterId={activeFilterId}
                                    isSelected={isSelected}
                                    onPress={handleSubOptionSelect}
                                    index={index}
                                    progress={subMenuProgress}
                                    isTransitioning={isTransitioning}
                                    bottomPosition={bottomPosition}
                                />
                            );
                        })}
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalWrapper: {
        flex: 1,
    },
    overlay: {
        ...StyleSheet.absoluteFill,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        // paddingTop removed to center vertically
    },
    container: {
        width: 320,
        alignItems: 'center',
        position: 'relative',
        // Fixed height to accommodate fully expanded state
        // Height = (number of items) * (item height + padding)
        // For 4 items (header + 3 filters): 4 * (60 + 8) = 272
        height: 300, // Slightly more to accommodate all cards when expanded
    },
    item: {
        width: 320,
        borderRadius: 16,
        padding: 12,
        position: 'absolute',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#f3f4f6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    iconBoxSelected: {
        backgroundColor: 'rgba(219, 35, 33, 0.2)',
    },
    title: {
        fontSize: 14,
        fontWeight: '500',
        color: '#111827',
        letterSpacing: 1.2,
        textTransform: 'uppercase',
    },
    titleSelected: {
        color: '#db2321',
    },
    arrowBox: {
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 'auto',
    },
    subItem: {
        width: 320,
        height: ITEM_HEIGHT,
        padding: 12,
        borderRadius: 16,
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
        justifyContent: 'center',
    },
    subItemSelected: {
        backgroundColor: 'hsl(0, 79%, 87%)',
        borderColor: '#db2321',
    },
    subItemText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6b7280',
    },
    subItemTextSelected: {
        color: '#db2321',
        fontWeight: '600',
    },
});
