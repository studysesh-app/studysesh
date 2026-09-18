import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useState } from 'react';
import { AnimatedPricingSlider } from '../ui/AnimatedPricingSlider';
import { AnimatedPriceDisplay } from '../ui/AnimatedPriceDisplay';
import { AnimatedTabs, TabData } from '../../reference/AnimatedTabs';
import { useMemo } from 'react';

interface TutorPricingSetupScreenProps {
    courses: string[];
    onBack: () => void;
    onContinue: (pricing: Record<string, { group: number; individual: number }>) => void;
    isDarkMode?: boolean;
}

export function TutorPricingSetupScreen({ courses, onBack, onContinue, isDarkMode = false }: TutorPricingSetupScreenProps) {
    // Session Type State
    const sessionTypes: Array<'online' | 'in-person' | 'both'> = ['online', 'in-person', 'both'];
    const [sessionTypeIndex, setSessionTypeIndex] = useState(2); // Default 'both'
    const sessionType = sessionTypes[sessionTypeIndex];

    // Store separate prices for each session type
    const [sessionTypePricing, setSessionTypePricing] = useState<
        Record<'online' | 'in-person' | 'both', { group: number; individual: number }>
    >({
        'online': { group: 15, individual: 28 },
        'in-person': { group: 15, individual: 28 },
        'both': { group: 15, individual: 28 },
    });

    // Get prices for CURRENT session type
    const groupPrice = sessionTypePricing[sessionType].group;
    const individualPrice = sessionTypePricing[sessionType].individual;



    const sessionTabs: TabData[] = useMemo(() => [
        { id: 'online', title: 'Online', content: <></> },
        { id: 'in-person', title: 'In-Person', content: <></> },
        { id: 'both', title: 'Both', content: <></> },
    ], []);

    const handleContinue = () => {
        // Use the pricing of the currently selected session type as the default
        const currentPricing = sessionTypePricing[sessionType];

        const pricing: Record<string, { group: number; individual: number }> = {};
        courses.forEach((course) => {
            pricing[course] = { group: currentPricing.group, individual: currentPricing.individual };
        });
        onContinue(pricing);
    };

    const adjustPrice = (type: 'group' | 'individual', val: number) => {
        setSessionTypePricing(prev => ({
            ...prev,
            [sessionType]: {
                ...prev[sessionType],
                [type]: val
            }
        }));
    };

    return (
        <View className="flex-1 bg-white dark:bg-gray-900">
            <ScrollView className="flex-1 px-4 pt-6">
                <View className="flex-row items-center mb-6 relative">
                    <TouchableOpacity onPress={onBack} className="absolute left-0 z-10 p-2 -ml-2">
                        <ArrowLeft size={24} color={isDarkMode ? '#fff' : '#000'} />
                    </TouchableOpacity>
                    <Text className="flex-1 text-center text-2xl font-bold text-gray-900 dark:text-white" style={{ color: isDarkMode ? '#fff' : '#111827' }}>
                        Set Your Pricing
                    </Text>
                </View>

                {/* Progress - Step 5 of 6 */}
                <View className="flex-row gap-2 mb-4">
                    <View className="flex-1 h-1 rounded-full bg-red-600" />
                    <View className="flex-1 h-1 rounded-full bg-red-600" />
                    <View className="flex-1 h-1 rounded-full bg-red-600" />
                    <View className="flex-1 h-1 rounded-full bg-red-600" />
                    <View className="flex-1 h-1 rounded-full bg-red-600" />
                    <View className="flex-1 h-1 rounded-full bg-gray-200" />
                </View>
                <Text className="text-sm text-gray-500 mb-8">Step 5 of 6</Text>

                <Text className="text-base text-center text-gray-500 mb-8">
                    Set your default hourly rates for tutoring sessions
                </Text>

                {/* Applied Courses Preview */}
                <View className="mb-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
                    <Text className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Applied Courses ({courses.length})
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                        {courses.map((course) => (
                            <View key={course} className="px-3 py-1 bg-red-50 rounded-full">
                                <Text className="text-red-600 text-xs font-medium">
                                    {course}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Session Type Toggle */}
                <View className="mb-8">
                    <Text className="text-base font-semibold text-gray-900 dark:text-white mb-4 text-center" style={{ color: isDarkMode ? '#fff' : '#111827' }}>
                        How do you tutor?
                    </Text>
                    <AnimatedTabs
                        tabs={sessionTabs}
                        activeTabIndex={sessionTypeIndex}
                        onTabChange={setSessionTypeIndex}
                        variant="pill"
                        isDarkMode={isDarkMode}
                    />
                </View>

                {/* Group Session Pricing */}
                <View className="mb-10">
                    <Text className="text-base font-semibold text-gray-900 dark:text-white mb-6 text-center">
                        Group Session Rate
                    </Text>

                    {/* Centered Large Pricing Bubble */}
                    <View className="items-center mb-8">
                        <View style={{
                            paddingHorizontal: 24,
                            paddingVertical: 12,
                            borderRadius: 9999,
                            backgroundColor: isDarkMode ? '#1e3a8a' : '#dbeafe',
                            transform: [{ scale: 1.1 }],
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.05,
                            shadowRadius: 2,
                            elevation: 2,
                        }}>
                            <AnimatedPriceDisplay
                                value={groupPrice}
                                color={isDarkMode ? '#93c5fd' : '#1d4ed8'}
                                fontSize={30}
                            />
                        </View>
                        <Text className="text-xs text-gray-500 mt-3 font-medium">
                            3-10 students per session
                        </Text>
                    </View>

                    <View className="px-6">
                        <View className="flex-row justify-between mb-2 px-1">
                            <Text className="text-xs text-gray-400 font-medium">$2</Text>
                            <Text className="text-xs text-gray-400 font-medium">$10</Text>
                        </View>
                        <AnimatedPricingSlider
                            min={2}
                            max={10}
                            step={1}
                            value={groupPrice}
                            onValueChange={(val) => adjustPrice('group', val)}
                            color="#3b82f6" // blue-500
                            isDarkMode={isDarkMode}
                        />
                    </View>
                </View>

                {/* Individual Session Pricing */}
                <View className="mb-8">
                    <Text className="text-base font-semibold text-gray-900 dark:text-white mb-6 text-center">
                        1-on-1 Session Rate
                    </Text>

                    {/* Centered Large Pricing Bubble */}
                    <View className="items-center mb-8">
                        <View style={{
                            paddingHorizontal: 24,
                            paddingVertical: 12,
                            borderRadius: 9999,
                            backgroundColor: isDarkMode ? '#14532d' : '#dcfce7',
                            transform: [{ scale: 1.1 }],
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.05,
                            shadowRadius: 2,
                            elevation: 2,
                        }}>
                            <AnimatedPriceDisplay
                                value={individualPrice}
                                color={isDarkMode ? '#86efac' : '#15803d'}
                                fontSize={30}
                            />
                        </View>
                        <Text className="text-xs text-gray-500 mt-3 font-medium">
                            Private tutoring session
                        </Text>
                    </View>

                    <View className="px-6">
                        <View className="flex-row justify-between mb-2 px-1">
                            <Text className="text-xs text-gray-400 font-medium">$10</Text>
                            <Text className="text-xs text-gray-400 font-medium">$30</Text>
                        </View>
                        <AnimatedPricingSlider
                            min={10}
                            max={30}
                            step={1}
                            value={individualPrice}
                            onValueChange={(val) => adjustPrice('individual', val)}
                            color="#22c55e" // green-500
                            isDarkMode={isDarkMode}
                        />
                    </View>
                </View>

                {/* Info Box */}
                <View className="mt-8 p-4 bg-red-50 rounded-xl">
                    <Text className="text-sm text-gray-500 text-center">
                        💡 You can customize pricing per course later in your profile settings
                    </Text>
                </View>
            </ScrollView>

            {/* Continue Button */}
            <View className="p-4 border-t border-gray-200 dark:border-gray-800">
                <TouchableOpacity
                    onPress={handleContinue}
                    className="w-full py-4 bg-red-600 rounded-full shadow-sm"
                >
                    <Text className="text-center text-white text-base font-semibold">
                        Continue
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
