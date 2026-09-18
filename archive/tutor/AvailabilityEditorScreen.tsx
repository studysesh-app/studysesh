import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { CalendarPicker } from '../CalendarPicker';
import { Picker } from '@react-native-picker/picker';

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
        const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        const isAlreadySelected = selectedDates.some((d) => {
            const dKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
            return dKey === dateKey;
        });

        if (isAlreadySelected) {
            setSelectedDates(
                selectedDates.filter((d) => {
                    const dKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
                    return dKey !== dateKey;
                })
            );
        } else {
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
            Alert.alert('Error', 'Please select at least one date and add at least one time slot');
            return;
        }
        onSave({
            dates: selectedDates,
            timeSlots,
            recurring,
        });
    };

    const formatTime = (time: string) => {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    };

    return (
        <View className="flex-1 bg-white dark:bg-gray-900">
            {/* Header */}
            <View className="flex-row items-center px-4 py-4 border-b border-gray-200 dark:border-gray-800 pt-12">
                <TouchableOpacity onPress={onBack} className="p-2 -ml-2">
                    <ArrowLeft size={24} color="#000" />
                </TouchableOpacity>
                <Text className="flex-1 text-center text-xl font-bold pr-10 text-gray-900 dark:text-white">
                    Edit Availability
                </Text>
            </View>

            <ScrollView className="flex-1 px-4 py-6">
                {/* Calendar */}
                <View className="mb-6">
                    <Text className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                        Select Available Dates
                    </Text>
                    <CalendarPicker
                        availableDates={[]} // Allow all dates
                        onDateSelect={handleDateSelect}
                        selectedDates={selectedDates}
                        multiSelect={true}
                    />
                    {selectedDates.length > 0 && (
                        <Text className="mt-2 text-sm text-gray-500">
                            {selectedDates.length} date{selectedDates.length !== 1 ? 's' : ''} selected
                        </Text>
                    )}
                </View>

                {/* Recurring Toggle */}
                <View className="mb-6">
                    <Text className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                        Recurring Pattern
                    </Text>
                    <View className="flex-row gap-2">
                        {(['none', 'weekly', 'biweekly'] as const).map((option) => (
                            <TouchableOpacity
                                key={option}
                                onPress={() => setRecurring(option)}
                                className={`flex-1 py-2.5 px-4 rounded-full border ${recurring === option
                                    ? 'bg-red-600 border-red-600'
                                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                    }`}
                            >
                                <Text
                                    className={`text-center text-sm font-medium ${recurring === option ? 'text-white' : 'text-gray-900 dark:text-white'
                                        }`}
                                >
                                    {option === 'none' ? 'One-time' : option === 'weekly' ? 'Weekly' : 'Bi-weekly'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Time Slots */}
                <View className="mb-6">
                    <View className="flex-row items-center justify-between mb-3">
                        <Text className="text-base font-semibold text-gray-900 dark:text-white">
                            Time Slots
                        </Text>
                        <TouchableOpacity
                            onPress={() => setShowAddSlot(!showAddSlot)}
                            className="flex-row items-center gap-2 px-3 py-1.5 bg-red-600 rounded-full"
                        >
                            <Plus size={16} color="white" />
                            <Text className="text-white text-sm font-medium">Add Slot</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Add Slot Form */}
                    {showAddSlot && (
                        <View className="mb-4 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl gap-4">
                            {/* Time */}
                            <View>
                                <Text className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                    Time (HH:MM)
                                </Text>
                                <TextInput
                                    value={newSlotTime}
                                    onChangeText={setNewSlotTime}
                                    placeholder="10:00"
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                                />
                            </View>

                            {/* Duration */}
                            <View>
                                <Text className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                    Duration (minutes)
                                </Text>
                                <View className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                                    <Picker
                                        selectedValue={newSlotDuration}
                                        onValueChange={(itemValue: number) => setNewSlotDuration(itemValue)}
                                        style={{ height: 50, width: '100%' }}
                                    >
                                        <Picker.Item label="30 minutes" value={30} />
                                        <Picker.Item label="1 hour" value={60} />
                                        <Picker.Item label="1.5 hours" value={90} />
                                        <Picker.Item label="2 hours" value={120} />
                                    </Picker>
                                </View>
                            </View>

                            {/* Type */}
                            <View>
                                <Text className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                    Session Type
                                </Text>
                                <View className="flex-row gap-2">
                                    {(['group', 'individual'] as const).map((type) => (
                                        <TouchableOpacity
                                            key={type}
                                            onPress={() => setNewSlotType(type)}
                                            className={`flex-1 py-2 px-4 rounded-lg border ${newSlotType === type
                                                ? 'bg-red-50 border-red-600'
                                                : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                                                }`}
                                        >
                                            <Text
                                                className={`text-center text-sm font-medium ${newSlotType === type ? 'text-red-600' : 'text-gray-900 dark:text-white'
                                                    }`}
                                            >
                                                {type === 'group' ? 'Group' : '1-on-1'}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Max Students (for group only) */}
                            {newSlotType === 'group' && (
                                <View>
                                    <Text className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                        Max Students
                                    </Text>
                                    <TextInput
                                        keyboardType="numeric"
                                        value={newSlotMaxStudents.toString()}
                                        onChangeText={(text) => setNewSlotMaxStudents(Number(text))}
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                                    />
                                </View>
                            )}

                            {/* Location */}
                            <View>
                                <Text className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                    Location
                                </Text>
                                <View className="flex-row gap-2">
                                    {(['online', 'in-person'] as const).map((loc) => (
                                        <TouchableOpacity
                                            key={loc}
                                            onPress={() => setNewSlotLocation(loc)}
                                            className={`flex-1 py-2 px-4 rounded-lg border ${newSlotLocation === loc
                                                ? 'bg-red-50 border-red-600'
                                                : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                                                }`}
                                        >
                                            <Text
                                                className={`text-center text-sm font-medium ${newSlotLocation === loc ? 'text-red-600' : 'text-gray-900 dark:text-white'
                                                    }`}
                                            >
                                                {loc === 'online' ? 'Online' : 'In-Person'}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Actions */}
                            <View className="flex-row gap-2 pt-2">
                                <TouchableOpacity
                                    onPress={() => setShowAddSlot(false)}
                                    className="flex-1 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
                                >
                                    <Text className="text-center text-sm font-medium text-gray-900 dark:text-white">
                                        Cancel
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleAddTimeSlot}
                                    className="flex-1 py-2 bg-red-600 rounded-lg"
                                >
                                    <Text className="text-center text-sm font-medium text-white">
                                        Add
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    {/* Existing Slots */}
                    {timeSlots.length === 0 ? (
                        <View className="py-8 items-center">
                            <Text className="text-gray-500 text-sm">
                                No time slots added yet
                            </Text>
                        </View>
                    ) : (
                        <View className="gap-2">
                            {timeSlots.map((slot) => (
                                <View
                                    key={slot.id}
                                    className="flex-row items-center gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
                                >
                                    <View className="flex-1">
                                        <View className="flex-row items-center gap-2 mb-1">
                                            <Text className="text-base font-semibold text-gray-900 dark:text-white">
                                                {formatTime(slot.time)}
                                            </Text>
                                            <Text className="text-sm text-gray-500">
                                                ({slot.duration} min)
                                            </Text>
                                        </View>
                                        <View className="flex-row items-center gap-2">
                                            <View
                                                className={`px-2 py-0.5 rounded-full ${slot.type === 'group'
                                                    ? 'bg-blue-100 dark:bg-blue-900/20'
                                                    : 'bg-green-100 dark:bg-green-900/30'
                                                    }`}
                                            >
                                                <Text
                                                    className={`text-xs ${slot.type === 'group'
                                                        ? 'text-blue-700 dark:text-blue-400'
                                                        : 'text-green-700 dark:text-green-400'
                                                        }`}
                                                >
                                                    {slot.type === 'group' ? `Group (max ${slot.maxStudents})` : '1-on-1'}
                                                </Text>
                                            </View>
                                            <Text className="text-xs text-gray-500">•</Text>
                                            <Text className="text-xs text-gray-500">
                                                {slot.location === 'online' ? 'Online' : 'In-Person'}
                                            </Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => handleRemoveSlot(slot.id)}
                                        className="p-2"
                                    >
                                        <Trash2 size={16} color="#ef4444" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Save Button */}
            <View className="p-4 border-t border-gray-200 dark:border-gray-800">
                <TouchableOpacity
                    onPress={handleSave}
                    disabled={selectedDates.length === 0 || timeSlots.length === 0}
                    className={`w-full py-4 rounded-full shadow-sm ${selectedDates.length === 0 || timeSlots.length === 0
                        ? 'bg-gray-300 dark:bg-gray-700'
                        : 'bg-red-600'
                        }`}
                >
                    <Text className="text-center text-white text-base font-semibold">
                        Save Availability
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
