import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useState } from 'react';
import { AnimatedPricingSlider } from '../ui/AnimatedPricingSlider';
import { AnimatedPriceDisplay } from '../ui/AnimatedPriceDisplay';

interface TutorPricingSetupScreenProps {
    courses: string[];
    onBack: () => void;
    onContinue: (pricing: Record<string, { group: number; individual: number }>) => void;
}

export function TutorPricingSetupScreen({ courses, onBack, onContinue }: TutorPricingSetupScreenProps) {
    const [groupPrice, setGroupPrice] = useState(15);
    const [individualPrice, setIndividualPrice] = useState(28);

    const handleContinue = () => {
        const pricing: Record<string, { group: number; individual: number }> = {};
        courses.forEach((course) => {
            pricing[course] = { group: groupPrice, individual: individualPrice };
        });
        onContinue(pricing);
    };

    const adjustPrice = (type: 'group' | 'individual', val: number) => {
        if (type === 'group') {
            setGroupPrice(val);
        } else {
            setIndividualPrice(val);
        }
    };

    return (
        <View className="flex-1 bg-white dark:bg-gray-900">
            <ScrollView className="flex-1 px-4 pt-6">
                <View className="flex-row items-center mb-6 relative">
                    <TouchableOpacity onPress={onBack} className="absolute left-0 z-10 p-2 -ml-2">
                        <ArrowLeft size={24} color="#000" />
                    </TouchableOpacity>
                    <Text className="flex-1 text-center text-2xl font-bold text-gray-900 dark:text-white">
                        Set Your Pricing
                    </Text>
                </View>
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

                {/* Group Session Pricing */}
                <View className="mb-10">
                    <Text className="text-base font-semibold text-gray-900 dark:text-white mb-6 text-center">
                        Group Session Rate
                    </Text>

                    {/* Centered Large Pricing Bubble */}
                    <View className="items-center mb-8">
                        <View className="px-6 py-3 bg-blue-100 dark:bg-blue-900/30 rounded-full shadow-sm transform scale-110">
                            <AnimatedPriceDisplay
                                value={groupPrice}
                                color="#1d4ed8" // blue-700
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
                        <View className="px-6 py-3 bg-green-100 dark:bg-green-900/30 rounded-full shadow-sm transform scale-110">
                            <AnimatedPriceDisplay
                                value={individualPrice}
                                color="#15803d" // green-700
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
