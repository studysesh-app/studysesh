import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { ArrowLeft, Check } from 'lucide-react-native';
import { useState } from 'react';
import { AnimatedPricingSlider } from '../ui/AnimatedPricingSlider';
import { AnimatedPriceDisplay } from '../ui/AnimatedPriceDisplay';
import { SkeuomorphicCoursePicker } from '../ui/SkeuomorphicCoursePicker';
// Removed unused Slider import

interface PricingEditorScreenProps {
    courses: string[];
    initialGroupPrice: number;
    initialIndividualPrice: number;
    initialPerCoursePricing?: Record<string, { group: number; individual: number }>;
    onBack: () => void;
    onSave: (data: {
        applyToAll: boolean;
        globalGroupPrice: number;
        globalIndividualPrice: number;
        perCoursePricing: Record<string, { group: number; individual: number }>;
    }) => void;
}

export function PricingEditorScreen({
    courses,
    initialGroupPrice,
    initialIndividualPrice,
    initialPerCoursePricing = {},
    onBack,
    onSave,
}: PricingEditorScreenProps) {
    const hasPerCoursePricing = Object.keys(initialPerCoursePricing).length > 0;

    const [applyToAll, setApplyToAll] = useState(!hasPerCoursePricing);
    const [globalGroupPrice, setGlobalGroupPrice] = useState(initialGroupPrice);
    const [globalIndividualPrice, setGlobalIndividualPrice] = useState(initialIndividualPrice);
    const [selectedCourse, setSelectedCourse] = useState(courses[0] || '');
    const [perCoursePricing, setPerCoursePricing] = useState<Record<string, { group: number; individual: number }>>(
        initialPerCoursePricing
    );

    const currentGroupPrice = applyToAll
        ? globalGroupPrice
        : perCoursePricing[selectedCourse]?.group ?? globalGroupPrice;
    const currentIndividualPrice = applyToAll
        ? globalIndividualPrice
        : perCoursePricing[selectedCourse]?.individual ?? globalIndividualPrice;

    const handleGroupPriceChange = (newValue: number) => {
        if (applyToAll) {
            setGlobalGroupPrice(newValue);
        } else {
            setPerCoursePricing({
                ...perCoursePricing,
                [selectedCourse]: {
                    group: newValue,
                    individual: perCoursePricing[selectedCourse]?.individual ?? globalIndividualPrice,
                },
            });
        }
    };

    const handleIndividualPriceChange = (newValue: number) => {
        if (applyToAll) {
            setGlobalIndividualPrice(newValue);
        } else {
            setPerCoursePricing({
                ...perCoursePricing,
                [selectedCourse]: {
                    group: perCoursePricing[selectedCourse]?.group ?? globalGroupPrice,
                    individual: newValue,
                },
            });
        }
    };

    const handleSave = () => {
        onSave({
            applyToAll,
            globalGroupPrice,
            globalIndividualPrice,
            perCoursePricing,
        });
    };

    return (
        <View className="flex-1 bg-white dark:bg-gray-900">
            {/* Header */}
            <View className="flex-row items-center px-4 py-4 border-b border-gray-200 dark:border-gray-800 pt-12">
                <TouchableOpacity onPress={onBack} className="p-2 -ml-2">
                    <ArrowLeft size={24} color="#000" />
                </TouchableOpacity>
                <Text className="flex-1 text-center text-xl font-bold pr-10 text-gray-900 dark:text-white">
                    Edit Pricing
                </Text>
            </View>

            <ScrollView className="flex-1 px-4 py-6">
                {/* Apply to All Checkbox */}
                <TouchableOpacity
                    onPress={() => setApplyToAll(!applyToAll)}
                    className="flex-row items-center gap-3 w-full p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl mb-6"
                >
                    <View
                        className={`w-6 h-6 rounded-md border-2 items-center justify-center ${applyToAll ? 'bg-red-600 border-red-600' : 'border-gray-300 dark:border-gray-600'
                            }`}
                    >
                        {applyToAll && <Check size={14} color="white" />}
                    </View>
                    <View className="flex-1">
                        <Text className="text-base font-medium text-gray-900 dark:text-white">
                            Apply to all courses
                        </Text>
                        <Text className="text-sm text-gray-500">
                            Use same pricing for all courses
                        </Text>
                    </View>
                </TouchableOpacity>

                {/* Course Selector (if not applying to all) */}
                {!applyToAll && courses.length > 0 && (
                    <View className="mb-6">
                        <Text className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Select Course
                        </Text>
                        <SkeuomorphicCoursePicker
                            courses={courses}
                            selectedValue={selectedCourse}
                            onValueChange={(itemValue: string) => setSelectedCourse(itemValue)}
                            placeholder="Select a course"
                        />
                    </View>
                )}

                {/* Group Session Pricing */}
                <View className="mb-10">
                    <Text className="text-base font-semibold text-gray-900 dark:text-white mb-6 text-center">
                        Group Session Pricing
                    </Text>

                    {/* Centered Large Pricing Bubble */}
                    <View className="items-center mb-8">
                        <View className="px-6 py-3 bg-blue-100 dark:bg-blue-900/30 rounded-full shadow-sm transform scale-110">
                            <AnimatedPriceDisplay
                                value={currentGroupPrice}
                                color="#1d4ed8" // blue-700
                                fontSize={30}
                            />
                        </View>
                    </View>

                    <View className="px-2">
                        <View className="flex-row justify-between mb-2 px-1">
                            <Text className="text-xs text-gray-400 font-medium">$2</Text>
                            <Text className="text-xs text-gray-400 font-medium">$10</Text>
                        </View>
                        <AnimatedPricingSlider
                            min={2}
                            max={10}
                            step={1}
                            value={currentGroupPrice}
                            onValueChange={handleGroupPriceChange}
                            color="#3b82f6" // blue-500
                        />
                    </View>
                </View>

                {/* Individual Session Pricing */}
                <View className="mb-8">
                    <Text className="text-base font-semibold text-gray-900 dark:text-white mb-6 text-center">
                        1-on-1 Session Pricing
                    </Text>

                    {/* Centered Large Pricing Bubble */}
                    <View className="items-center mb-8">
                        <View className="px-6 py-3 bg-green-100 dark:bg-green-900/30 rounded-full shadow-sm transform scale-110">
                            <AnimatedPriceDisplay
                                value={currentIndividualPrice}
                                color="#15803d" // green-700
                                fontSize={30}
                            />
                        </View>
                    </View>

                    <View className="px-2">
                        <View className="flex-row justify-between mb-2 px-1">
                            <Text className="text-xs text-gray-400 font-medium">$10</Text>
                            <Text className="text-xs text-gray-400 font-medium">$30</Text>
                        </View>
                        <AnimatedPricingSlider
                            min={10}
                            max={30}
                            step={1}
                            value={currentIndividualPrice}
                            onValueChange={handleIndividualPriceChange}
                            color="#22c55e" // green-500
                        />
                    </View>
                </View>

                {/* Preview */}
                {!applyToAll && (
                    <View className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
                        <Text className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                            Course-Specific Pricing
                        </Text>
                        <View className="gap-2">
                            {courses.map((course) => {
                                const pricing = perCoursePricing[course] || {
                                    group: globalGroupPrice,
                                    individual: globalIndividualPrice,
                                };
                                return (
                                    <View key={course} className="flex-row items-center justify-between">
                                        <Text className="text-sm text-gray-900 dark:text-white">
                                            {course}
                                        </Text>
                                        <View className="flex-row gap-2">
                                            <Text className="text-sm text-red-600">
                                                Group: ${pricing.group}
                                            </Text>
                                            <Text className="text-sm text-gray-500">•</Text>
                                            <Text className="text-sm text-green-700 dark:text-green-400">
                                                1-on-1: ${pricing.individual}
                                            </Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Save Button */}
            <View className="p-4 border-t border-gray-200 dark:border-gray-800">
                <TouchableOpacity
                    onPress={handleSave}
                    className="w-full py-4 bg-red-600 rounded-full shadow-sm"
                >
                    <Text className="text-center text-white text-base font-semibold">
                        Save Pricing
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
