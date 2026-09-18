import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { ArrowLeft, User, UserCircle } from 'lucide-react-native';
import { useState } from 'react';
import { SkeuomorphicCoursePicker } from '../ui/SkeuomorphicCoursePicker';
import { PronounSelector } from '../ui/PronounSelector';

interface StudentProfileCompletionScreenProps {
    onBack: () => void;
    onContinue: (profileData: { name: string; pronouns: string; year: string }) => void;
    onSkip: () => void;
}

export function StudentProfileCompletionScreen({ onBack, onContinue, onSkip }: StudentProfileCompletionScreenProps) {
    const [name, setName] = useState('');
    const [pronouns, setPronouns] = useState<string[]>([]);
    const [year, setYear] = useState('');

    const handleContinue = () => {
        onContinue({
            name: name || 'Student',
            pronouns: pronouns.length > 0 ? pronouns.join('/') : 'They/Them',
            year: year || '1st Year',
        });
    };

    return (
        <View className="flex-1 bg-white dark:bg-gray-900">
            <ScrollView className="flex-1 px-4 pt-6" contentContainerStyle={{ paddingBottom: 20 }}>
                <View className="flex-row items-center mb-6 relative">
                    <TouchableOpacity onPress={onBack} className="absolute left-0 z-10 p-2 -ml-2">
                        <ArrowLeft size={24} color="#000" />
                    </TouchableOpacity>
                    <Text className="flex-1 text-center text-2xl font-bold text-gray-900 dark:text-white">
                        Complete Profile
                    </Text>
                </View>
                <Text className="text-base text-center text-gray-500 mb-6">
                    Help tutors get to know you better
                </Text>

                {/* Avatar Placeholder */}
                <View className="items-center mb-8">
                    <View className="relative">
                        <View className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full items-center justify-center">
                            <UserCircle size={80} color="#9ca3af" />
                        </View>
                        <TouchableOpacity className="absolute bottom-0 right-0 w-8 h-8 bg-red-600 rounded-full items-center justify-center border-2 border-white dark:border-gray-900">
                            <Text className="text-white text-lg font-bold">+</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Name Field */}
                <View className="mb-4">
                    <Text className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Full Name
                    </Text>
                    <View className="relative">
                        <View className="absolute left-4 top-3.5 z-10">
                            <User size={20} color="#9ca3af" />
                        </View>
                        <TextInput
                            value={name}
                            onChangeText={setName}
                            placeholder="Enter your name"
                            placeholderTextColor="#9ca3af"
                            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
                        />
                    </View>
                </View>

                {/* Pronouns Field */}
                <View className="mb-4">
                    <Text className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Pronouns
                    </Text>
                    <PronounSelector
                        options={[
                            { label: 'he', value: 'He' },
                            { label: 'him', value: 'Him' },
                            { label: 'she', value: 'She' },
                            { label: 'her', value: 'Her' },
                            { label: 'they', value: 'They' },
                            { label: 'them', value: 'Them' },
                        ]}
                        selectedValues={pronouns}
                        onSelect={setPronouns}
                    />
                </View>

                {/* Year Dropdown */}
                <View className="mb-6">
                    <Text className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Year of Study
                    </Text>
                    <SkeuomorphicCoursePicker
                        courses={['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year+']}
                        selectedValue={year}
                        onValueChange={(itemValue: string) => setYear(itemValue)}
                        placeholder="Select year"
                    />
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
