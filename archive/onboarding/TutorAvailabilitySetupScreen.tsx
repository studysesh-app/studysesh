import { View, Text, TouchableOpacity, ScrollView, useColorScheme } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useState } from 'react';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { DaySelector } from '../ui/DaySelector';
import { DayAvailabilityCard } from '../ui/DayAvailabilityCard';
import { TimeSlotModal } from '../ui/TimeSlotModal';

interface TutorAvailabilitySetupScreenProps {
    onBack: () => void;
    onContinue: () => void;
}

interface TimeSlot {
    id: string;
    startTime: string;
    endTime: string;
    repeat: string;
}

type AvailabilityMap = Record<string, TimeSlot[]>;

export function TutorAvailabilitySetupScreen({ onBack, onContinue }: TutorAvailabilitySetupScreenProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [selectedDays, setSelectedDays] = useState<string[]>([]);
    const [availability, setAvailability] = useState<AvailabilityMap>({});
    const [modalVisible, setModalVisible] = useState(false);
    const [editingDay, setEditingDay] = useState<string | null>(null);

    const handleAddSlot = (day: string) => {
        setEditingDay(day);
        setModalVisible(true);
    };

    const handleSaveSlot = (data: { startTime: string; endTime: string; repeat: string }) => {
        if (!editingDay) return;

        const newSlot: TimeSlot = {
            id: Date.now().toString(),
            ...data,
        };

        setAvailability((prev) => ({
            ...prev,
            [editingDay]: [...(prev[editingDay] || []), newSlot],
        }));
    };

    const handleDeleteSlot = (day: string, slotId: string) => {
        setAvailability((prev) => ({
            ...prev,
            [day]: prev[day].filter((slot) => slot.id !== slotId),
        }));
    };

    return (
        <View className="flex-1 bg-white dark:bg-gray-900">
            <ScrollView className="flex-1 px-4 pt-6" contentContainerStyle={{ paddingBottom: 100 }}>
                <View className="flex-row items-center mb-6 relative">
                    <TouchableOpacity onPress={onBack} className="absolute left-0 z-10 p-2 -ml-2">
                        <ArrowLeft size={24} color={isDark ? '#fff' : '#000'} />
                    </TouchableOpacity>
                    <Text className="flex-1 text-center text-2xl font-bold text-gray-900 dark:text-white">
                        Set Availability
                    </Text>
                </View>
                <Text className="text-base text-center text-gray-500 mb-8">
                    Choose when you're available to tutor
                </Text>

                {/* Day Selection */}
                <View className="mb-8">
                    <Text className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                        Available Days
                    </Text>
                    <DaySelector
                        selectedDays={selectedDays}
                        onSelect={setSelectedDays}
                    />
                </View>

                {/* Availability Cards */}
                <View className="gap-2">
                    {selectedDays.length > 0 && (
                        <Animated.Text
                            entering={FadeIn}
                            exiting={FadeOut}
                            className="text-base font-semibold text-gray-900 dark:text-white mb-2"
                        >
                            Available Time Slots
                        </Animated.Text>
                    )}
                    {selectedDays.map((day) => (
                        <Animated.View
                            key={day}
                            entering={FadeIn.duration(300)}
                            exiting={FadeOut.duration(200)}
                            layout={LinearTransition.springify()}
                        >
                            <DayAvailabilityCard
                                day={day}
                                slots={availability[day] || []}
                                onAdd={() => handleAddSlot(day)}
                                onDelete={(id) => handleDeleteSlot(day, id)}
                            />
                        </Animated.View>
                    ))}
                </View>
            </ScrollView>

            {/* Continue Button */}
            <View className="absolute bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
                <TouchableOpacity
                    onPress={onContinue}
                    className="w-full py-4 bg-red-600 rounded-full shadow-sm"
                >
                    <Text className="text-center text-white text-base font-semibold">
                        Complete Setup
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Time Slot Modal */}
            <TimeSlotModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSave={handleSaveSlot}
                isDark={isDark}
            />
        </View>
    );
}

