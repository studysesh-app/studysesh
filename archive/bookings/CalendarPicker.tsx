import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

interface CalendarPickerProps {
    selectedDate?: Date;
    onDateSelect?: (date: Date) => void;
    onSelectDate?: (date: Date) => void; // Backwards compatibility
    availableDates?: Date[];
    selectedDates?: Date[]; // For multi-select mode
    multiSelect?: boolean;
}

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
            const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
            return selectedDates.some((d) => {
                const dKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
                return dKey === dateKey;
            });
        }
        if (!selectedDate) return false;
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
        <View className="rounded-2xl p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-4">
                <TouchableOpacity
                    onPress={goToPreviousMonth}
                    className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                >
                    <ChevronLeft size={20} color="#374151" />
                </TouchableOpacity>
                <Text className="text-base font-semibold text-gray-900 dark:text-white">
                    {monthName}
                </Text>
                <TouchableOpacity
                    onPress={goToNextMonth}
                    className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                >
                    <ChevronRight size={20} color="#374151" />
                </TouchableOpacity>
            </View>

            {/* Day labels */}
            <View className="flex-row justify-between mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                    <Text
                        key={index}
                        className="w-8 text-center text-sm font-medium text-gray-500"
                    >
                        {day}
                    </Text>
                ))}
            </View>

            {/* Calendar grid */}
            <View className="flex-row flex-wrap">
                {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                    <View key={`empty-${index}`} className="w-[14.28%] aspect-square" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, index) => {
                    const day = index + 1;
                    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
                    const available = isDateAvailable(date);
                    const selected = isDateSelected(date);

                    return (
                        <View key={day} className="w-[14.28%] aspect-square p-1">
                            <TouchableOpacity
                                onPress={() => available && handleDateSelect(date)}
                                disabled={!available}
                                className={`
                  flex-1 items-center justify-center rounded-full overflow-hidden
                  ${!available ? 'opacity-30' : ''}
                  ${!selected && available ? 'bg-gray-50 dark:bg-gray-800' : ''}
                `}
                            >
                                {selected && (
                                    <LinearGradient
                                        colors={['#db2321', '#a01a18']}
                                        className="absolute top-0 left-0 right-0 bottom-0"
                                    />
                                )}
                                <Text
                                    className={`
                    text-sm
                    ${selected ? 'text-white font-semibold' : 'text-gray-900 dark:text-gray-100'}
                  `}
                                >
                                    {day}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}
