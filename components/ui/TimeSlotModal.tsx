import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Modal, Platform } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
    runOnJS,
} from 'react-native-reanimated';
import { X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { IOSTimePicker } from './IOSTimePicker';
import { SkeuomorphicCoursePicker } from './SkeuomorphicCoursePicker';

const { height } = Dimensions.get('window');

interface TimeSlotModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (data: { startTime: string; endTime: string; repeat: string }) => void;
    isDark: boolean;
}

export function TimeSlotModal({ visible, onClose, onSave, isDark }: TimeSlotModalProps) {
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('10:00');
    const [repeat, setRepeat] = useState('Weekly');

    const translateY = useSharedValue(height);
    const opacity = useSharedValue(0);

    useEffect(() => {
        if (visible) {
            translateY.value = withSpring(0, { damping: 30, stiffness: 300 });
            opacity.value = withTiming(1, { duration: 200 });
        } else {
            translateY.value = withTiming(height, { duration: 250 });
            opacity.value = withTiming(0, { duration: 200 });
        }
    }, [visible]);

    const handleClose = () => {
        translateY.value = withTiming(height, { duration: 250 }, () => {
            runOnJS(onClose)();
        });
        opacity.value = withTiming(0, { duration: 200 });
    };

    const handleSave = () => {
        onSave({ startTime, endTime, repeat });
        handleClose();
    };

    const backdropStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    const sheetStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="none" onRequestClose={handleClose}>
            <View style={styles.container}>
                {/* Backdrop */}
                <TouchableOpacity style={StyleSheet.absoluteFill} onPress={handleClose} activeOpacity={1}>
                    <Animated.View style={[styles.backdrop, backdropStyle]} />
                </TouchableOpacity>

                {/* Modal Sheet */}
                <Animated.View style={[styles.sheet, sheetStyle, { backgroundColor: isDark ? '#1a1a1a' : '#ffffff' }]}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: isDark ? '#fff' : '#000' }]}>New Time Slot</Text>
                        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                            <X size={24} color={isDark ? '#fff' : '#000'} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.content}>
                        <View style={styles.section}>
                            <Text style={[styles.label, { color: isDark ? '#ccc' : '#333' }]}>Start:</Text>
                            <IOSTimePicker value={startTime} onChange={setStartTime} />
                        </View>

                        <View style={styles.section}>
                            <Text style={[styles.label, { color: isDark ? '#ccc' : '#333' }]}>End:</Text>
                            <IOSTimePicker value={endTime} onChange={setEndTime} />
                        </View>

                        <View style={[styles.section, { zIndex: 100 }]}>
                            <Text style={[styles.label, { color: isDark ? '#ccc' : '#333' }]}>Repeat:</Text>
                            <SkeuomorphicCoursePicker
                                courses={['Weekly', 'Bi-weekly']}
                                selectedValue={repeat}
                                onValueChange={setRepeat}
                                placeholder="Select frequency"
                                direction="up"
                            />
                        </View>

                        <TouchableOpacity onPress={handleSave} activeOpacity={0.8}>
                            <LinearGradient
                                colors={['#fecaca', '#fecaca']} // Coral-pink gradient
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.saveButton}
                            >
                                <Text style={styles.saveButtonText}>Save Slot</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFill,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    sheet: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '90%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.25,
        shadowRadius: 24,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
    },
    closeButton: {
        padding: 4,
    },
    content: {
        gap: 16,
    },
    section: {
        gap: 8,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
    },
    saveButton: {
        padding: 16,
        borderRadius: 999,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(252, 165, 165, 0.5)',
    },
    saveButtonText: {
        color: '#991b1b',
        fontSize: 16,
        fontWeight: '600',
    },
});
