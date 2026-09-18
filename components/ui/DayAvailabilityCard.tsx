import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme, Modal, Pressable, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, ChevronDown, Check } from 'lucide-react-native';

interface TimeSlot {
    id: string;
    startTime: string;
    endTime: string;
    repeat: string;
}

interface DayAvailabilityCardProps {
    day: string;
    slots: TimeSlot[];
    onAdd: () => void;
    onDelete: (id: string) => void;
}

interface DropdownOption {
    label: string;
    value: string;
    color: string;
    bgColor: string;
    darkBgColor: string;
}

function TinyDropdown({ options, value, onChange }: { options: DropdownOption[], value: string, onChange: (val: string) => void }) {
    const [visible, setVisible] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0, width: 0 });
    const triggerRef = React.useRef<View>(null);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const selectedOption = options.find(o => o.value === value) || options[0];

    const handleOpen = () => {
        triggerRef.current?.measure((x, y, width, height, pageX, pageY) => {
            setPosition({ x: pageX + (width / 2), y: pageY + height + 4, width });
            setVisible(true);
        });
    };

    return (
        <>
            <TouchableOpacity
                ref={triggerRef}
                onPress={handleOpen}
                style={[
                    styles.tinyDropdown,
                    {
                        backgroundColor: isDark ? selectedOption.darkBgColor : selectedOption.bgColor,
                        borderColor: selectedOption.color,
                    }
                ]}
            >
                <Text style={[styles.tinyDropdownText, { color: selectedOption.color }]}>
                    {selectedOption.label}
                </Text>
                <ChevronDown size={12} color={selectedOption.color} />
            </TouchableOpacity>

            <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
                <Pressable style={styles.modalOverlay} onPress={() => setVisible(false)}>
                    <View style={[
                        styles.dropdownMenu,
                        {
                            top: position.y,
                            left: position.x,
                            transform: [{ translateX: '-50%' as any }],
                            backgroundColor: isDark ? '#1f2937' : 'white',
                            borderColor: isDark ? '#374151' : '#e5e7eb',
                        }
                    ]}>
                        {options.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                onPress={() => {
                                    onChange(option.value);
                                    setVisible(false);
                                }}
                                style={[
                                    styles.dropdownItem,
                                    { borderBottomColor: isDark ? '#374151' : '#f3f4f6' }
                                ]}
                            >
                                <View style={[styles.colorDot, { backgroundColor: option.color }]} />
                                <Text style={[
                                    styles.dropdownItemText,
                                    { color: isDark ? '#fff' : '#111' },
                                    value === option.value && { color: option.color, fontWeight: '600' }
                                ]}>
                                    {option.label}
                                </Text>
                                {value === option.value && <Check size={14} color={option.color} />}
                            </TouchableOpacity>
                        ))}
                    </View>
                </Pressable>
            </Modal>
        </>
    );
}

// Format time for display (assuming 24h input like "09:00")
const formatTime = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, '0')} ${period}`;
};

function TimeSlotPill({ slot, onDelete }: { slot: TimeSlot, onDelete: (id: string) => void }) {
    const scale = useRef(new Animated.Value(1)).current;
    const opacity = useRef(new Animated.Value(1)).current;

    const handleDelete = () => {
        Animated.parallel([
            Animated.sequence([
                Animated.timing(scale, {
                    toValue: 1.15,
                    duration: 100,
                    useNativeDriver: true,
                    easing: Easing.out(Easing.quad),
                }),
                Animated.timing(scale, {
                    toValue: 0,
                    duration: 250,
                    useNativeDriver: true,
                    easing: Easing.in(Easing.quad),
                }),
            ]),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 200,
                delay: 50,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onDelete(slot.id);
        });
    };

    return (
        <Animated.View style={[styles.slotPill, { transform: [{ scale }], opacity }]}>
            <LinearGradient
                colors={['rgba(254, 202, 202, 1)', 'rgba(252, 165, 165, 1)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
            />
            <Text style={styles.slotText}>
                {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
            </Text>
            <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
                <X size={16} color="#991b1b" />
            </TouchableOpacity>
        </Animated.View>
    );
}

export function DayAvailabilityCard({ day, slots, onAdd, onDelete }: DayAvailabilityCardProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [sessionType, setSessionType] = useState('1-on-1');
    const [locationType, setLocationType] = useState('Online');

    const sessionOptions: DropdownOption[] = [
        { label: '1-on-1', value: '1-on-1', color: '#15803d', bgColor: '#f0fdf4', darkBgColor: 'rgba(21, 128, 61, 0.2)' },
        { label: 'Group', value: 'Group', color: '#1d4ed8', bgColor: '#eff6ff', darkBgColor: 'rgba(29, 78, 216, 0.2)' },
    ];

    const locationOptions: DropdownOption[] = [
        { label: 'Online', value: 'Online', color: '#c2410c', bgColor: '#fff7ed', darkBgColor: 'rgba(194, 65, 12, 0.2)' },
        { label: 'In-person', value: 'In-person', color: '#7e22ce', bgColor: '#faf5ff', darkBgColor: 'rgba(126, 34, 206, 0.2)' },
    ];

    return (
        <View style={[styles.container, isDark ? styles.containerDark : styles.containerLight]}>
            {/* Skeuomorphic Background */}
            <LinearGradient
                colors={isDark
                    ? ['rgba(30,30,30,1)', 'rgba(20,20,20,1)']
                    : ['rgba(255,255,255,1)', 'rgba(248,248,248,1)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
            />

            <View style={styles.headerRow}>
                <Text style={[styles.header, { color: isDark ? '#fff' : '#000' }]}>{day}</Text>
                <View style={styles.controls}>
                    <TinyDropdown
                        options={sessionOptions}
                        value={sessionType}
                        onChange={setSessionType}
                    />
                    <TinyDropdown
                        options={locationOptions}
                        value={locationType}
                        onChange={setLocationType}
                    />
                </View>
            </View>

            <View style={styles.slotsContainer}>
                {slots.map((slot) => (
                    <TimeSlotPill key={slot.id} slot={slot} onDelete={onDelete} />
                ))}

                {slots.length > 0 ? (
                    <TouchableOpacity onPress={onAdd} style={styles.addTextButton}>
                        <Text style={styles.addText}>+ Add time</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity onPress={onAdd} style={styles.fullAddButton}>
                        <Text style={styles.fullAddButtonText}>+ Add time</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 20,
        overflow: 'visible',
        borderWidth: 1,
        zIndex: 1,
    },
    containerLight: {
        borderColor: 'rgba(230, 230, 230, 0.8)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    containerDark: {
        borderColor: 'rgba(50, 50, 50, 0.8)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 4,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        zIndex: 10,
    },
    header: {
        fontSize: 18,
        fontWeight: '600',
    },
    controls: {
        flexDirection: 'row',
        gap: 10,
    },
    tinyDropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 10,
        borderWidth: 1,
        gap: 6,
    },
    tinyDropdownText: {
        fontSize: 13,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    dropdownMenu: {
        position: 'absolute',
        borderRadius: 12,
        borderWidth: 1,
        padding: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
        minWidth: 150,
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        gap: 8,
        borderRadius: 8,
    },
    dropdownItemText: {
        fontSize: 13,
        flexGrow: 1,
        flexShrink: 0,
    },
    colorDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    slotsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        alignItems: 'center',
        zIndex: 1,
    },
    slotPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 999,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(252, 165, 165, 0.5)',
    },
    slotText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#991b1b',
        marginRight: 8,
    },
    deleteButton: {
        padding: 2,
    },
    addTextButton: {
        padding: 8,
    },
    addText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#db2321',
    },
    fullAddButton: {
        width: '100%',
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 16,
        borderStyle: 'dashed',
    },
    fullAddButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#000',
    },
});
