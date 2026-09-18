import { View, Text, TouchableOpacity, Animated, LayoutChangeEvent } from 'react-native';
import { ReactNode, useRef, useEffect, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

export interface TabData {
    id: string;
    title: string;
    content: ReactNode;
    disabled?: boolean;
}

interface AnimatedTabsProps {
    tabs: TabData[];
    activeTabIndex: number;
    onTabChange: (index: number) => void;
    variant?: 'default' | 'pill' | 'underline';
    isDarkMode?: boolean;
}

export function AnimatedTabs({
    tabs,
    activeTabIndex,
    onTabChange,
    variant = 'pill',
    isDarkMode = false,
}: AnimatedTabsProps) {
    const [tabLayouts, setTabLayouts] = useState<Array<{ x: number; width: number }>>([]);
    const indicatorLeft = useRef(new Animated.Value(0)).current;
    const indicatorWidth = useRef(new Animated.Value(0)).current;
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (tabLayouts.length === tabs.length && tabLayouts[activeTabIndex]) {
            const layout = tabLayouts[activeTabIndex];
            const inset = variant === 'pill' ? 4 : 0;
            const adjustedLeft = layout.x + inset;
            const adjustedWidth = variant === 'pill' ? layout.width - (inset * 2) : layout.width;

            // On first render, set position immediately without animation
            if (isFirstRender.current) {
                indicatorLeft.setValue(adjustedLeft);
                indicatorWidth.setValue(adjustedWidth);
                isFirstRender.current = false;
            } else {
                // Subsequent changes use smooth animation
                Animated.parallel([
                    Animated.spring(indicatorLeft, {
                        toValue: adjustedLeft,
                        useNativeDriver: false,
                        stiffness: 400,
                        damping: 20,
                    }),
                    Animated.spring(indicatorWidth, {
                        toValue: adjustedWidth,
                        useNativeDriver: false,
                        stiffness: 400,
                        damping: 20,
                    }),
                ]).start();
            }
        }
    }, [activeTabIndex, tabLayouts, variant]);

    const handleTabLayout = (index: number, event: LayoutChangeEvent) => {
        const { x, width } = event.nativeEvent.layout;
        setTabLayouts((prev) => {
            const newLayouts = [...prev];
            newLayouts[index] = { x, width };
            return newLayouts;
        });
    };

    const handleTabPress = (index: number) => {
        onTabChange(index);
    };

    const getContainerStyles = () => {
        if (variant === 'pill') {
            return isDarkMode
                ? 'bg-gray-800 rounded-xl flex-row relative'
                : 'bg-gray-100 rounded-xl flex-row relative';
        }
        return isDarkMode
            ? 'border-b border-gray-700 flex-row relative'
            : 'border-b border-gray-200 flex-row relative';
    };

    const getTabStyles = (isActive: boolean, disabled: boolean) => {
        const baseStyles = 'items-center justify-center';
        const paddingStyles = 'px-4 py-2.5 flex-1';

        if (disabled) return `${baseStyles} ${paddingStyles} opacity-50`;

        return `${baseStyles} ${paddingStyles}`;
    };

    const getTextStyles = (isActive: boolean, disabled: boolean) => {
        const base = 'text-base';
        const weight = isActive ? 'font-semibold' : 'font-medium';

        if (disabled) return `${base} ${weight} text-gray-400`;

        if (variant === 'pill') {
            return `${base} ${weight} ${isActive ? 'text-white' : (isDarkMode ? 'text-gray-400' : 'text-gray-500')}`;
        }

        return `${base} ${weight} ${isActive ? 'text-red-600' : (isDarkMode ? 'text-gray-400' : 'text-gray-500')}`;
    };

    const renderIndicator = () => {
        if (variant === 'pill') {
            return (
                <Animated.View
                    style={{
                        position: 'absolute',
                        left: indicatorLeft,
                        width: indicatorWidth,
                        top: 4,
                        bottom: 4,
                        borderRadius: 8,
                        zIndex: 0,
                    }}
                >
                    <LinearGradient
                        colors={['#db2321', '#500908']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
                            flex: 1,
                            borderRadius: 8,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 4,
                            elevation: 3,
                        }}
                    />
                </Animated.View>
            );
        } else if (variant === 'underline') {
            return (
                <Animated.View
                    style={{
                        position: 'absolute',
                        left: indicatorLeft,
                        width: indicatorWidth,
                        bottom: 0,
                        height: 2,
                        backgroundColor: '#db2321',
                    }}
                />
            );
        } else {
            return (
                <Animated.View
                    style={{
                        position: 'absolute',
                        left: indicatorLeft,
                        width: indicatorWidth,
                        bottom: 0,
                        height: 0.5,
                        backgroundColor: '#db2321',
                    }}
                />
            );
        }
    };

    return (
        <View className="w-full">
            <View className={getContainerStyles()}>
                {renderIndicator()}
                {tabs.map((tab, index) => {
                    const isActive = activeTabIndex === index;
                    return (
                        <TouchableOpacity
                            key={tab.id}
                            onPress={() => !tab.disabled && handleTabPress(index)}
                            disabled={tab.disabled}
                            onLayout={(e) => handleTabLayout(index, e)}
                            className={getTabStyles(isActive, !!tab.disabled)}
                            style={{ zIndex: 10 }}
                        >
                            <Text className={getTextStyles(isActive, !!tab.disabled)}>
                                {tab.title}
                            </Text>
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

