import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { ArrowLeft, Check } from 'lucide-react-native';
import { useState } from 'react';

interface LanguageSelectionScreenProps {
    currentLanguage: string;
    onBack: () => void;
    onSelect: (language: string) => void;
}

const LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
    { code: 'es', name: 'Español' },
    { code: 'de', name: 'Deutsch' },
    { code: 'zh', name: '中文' },
    { code: 'ja', name: '日本語' },
    { code: 'ar', name: 'العربية' },
];

export function LanguageSelectionScreen({
    currentLanguage,
    onBack,
    onSelect,
}: LanguageSelectionScreenProps) {
    const [selected, setSelected] = useState(currentLanguage);

    const handleSelect = (language: string) => {
        setSelected(language);
        onSelect(language);
        // Auto-save and go back
        setTimeout(() => onBack(), 300);
    };

    return (
        <View className="flex-1 bg-white dark:bg-gray-900">
            {/* Header */}
            <View className="flex-row items-center px-4 py-4 border-b border-gray-200 dark:border-gray-800 pt-12">
                <TouchableOpacity onPress={onBack} className="p-2 -ml-2">
                    <ArrowLeft size={24} color="#000" />
                </TouchableOpacity>
                <Text className="flex-1 text-center text-xl font-bold pr-10 text-gray-900 dark:text-white">
                    Language
                </Text>
            </View>

            <ScrollView className="flex-1 px-4 py-6">
                <View className="gap-2">
                    {LANGUAGES.map((language) => {
                        const isSelected = selected === language.name;
                        return (
                            <TouchableOpacity
                                key={language.code}
                                onPress={() => handleSelect(language.name)}
                                className={`flex-row items-center justify-between p-4 rounded-xl border ${isSelected
                                        ? 'bg-red-50 border-red-600'
                                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                    }`}
                            >
                                <Text
                                    className={`text-base font-medium ${isSelected ? 'text-red-600' : 'text-gray-900 dark:text-white'
                                        }`}
                                >
                                    {language.name}
                                </Text>
                                {isSelected && (
                                    <View className="w-6 h-6 bg-red-600 rounded-full items-center justify-center">
                                        <Check size={14} color="white" />
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>
        </View>
    );
}
