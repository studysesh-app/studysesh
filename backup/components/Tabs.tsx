import { View, Text, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { ReactNode } from 'react';

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

export interface TabData {
    id: string;
    title: string;
    content: ReactNode;
    disabled?: boolean;
}

interface TabsProps {
    tabs: TabData[];
    activeTabIndex: number;
    onTabChange: (index: number) => void;
    variant?: 'default' | 'pill' | 'underline';
    size?: 'sm' | 'md' | 'lg';
}

export function Tabs({
    tabs,
    activeTabIndex,
    onTabChange,
    variant = 'default',
    size = 'md'
}: TabsProps) {

    const handleTabPress = (index: number) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        onTabChange(index);
    };

    const getContainerStyles = () => {
        if (variant === 'pill') {
            return 'bg-gray-100 dark:bg-gray-800 p-1 rounded-xl flex-row';
        }
        return 'border-b border-gray-200 dark:border-gray-700 flex-row';
    };

    const getTabStyles = (isActive: boolean, disabled: boolean) => {
        const baseStyles = 'items-center justify-center rounded-lg';
        const sizeStyles = size === 'sm' ? 'px-3 py-1.5' : size === 'lg' ? 'px-6 py-3' : 'px-4 py-2';

        if (disabled) return `${baseStyles} ${sizeStyles} opacity-50`;

        if (variant === 'pill') {
            return `${baseStyles} ${sizeStyles} ${isActive ? 'bg-white dark:bg-gray-700 shadow-sm' : ''}`;
        }

        return `${baseStyles} ${sizeStyles}`;
    };

    const getTextStyles = (isActive: boolean, disabled: boolean) => {
        const base = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base';
        const weight = isActive ? 'font-semibold' : 'font-medium';

        if (disabled) return `${base} ${weight} text-gray-400`;

        if (variant === 'pill') {
            return `${base} ${weight} ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`;
        }

        return `${base} ${weight} ${isActive ? 'text-red-600' : 'text-gray-500 dark:text-gray-400'}`;
    };

    return (
        <View className="w-full">
            <View className={getContainerStyles()}>
                {tabs.map((tab, index) => {
                    const isActive = activeTabIndex === index;
                    return (
                        <TouchableOpacity
                            key={tab.id}
                            onPress={() => !tab.disabled && handleTabPress(index)}
                            disabled={tab.disabled}
                            className={`flex-1 ${getTabStyles(isActive, !!tab.disabled)}`}
                        >
                            <Text className={getTextStyles(isActive, !!tab.disabled)}>
                                {tab.title}
                            </Text>
                            {variant !== 'pill' && isActive && (
                                <View className="absolute bottom-0 w-full h-0.5 bg-red-600" />
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>

            <View className="mt-4">
                {tabs[activeTabIndex]?.content}
            </View>
        </View>
    );
}
