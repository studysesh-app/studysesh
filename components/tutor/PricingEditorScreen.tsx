import { View, Text, TouchableOpacity, ScrollView, Dimensions, StyleSheet, Pressable } from 'react-native';
import { ArrowLeft, Check } from 'lucide-react-native';
import { useState, useEffect, useMemo } from 'react';
import { AnimatedPricingSlider } from '../ui/AnimatedPricingSlider';
import { AnimatedPriceDisplay } from '../ui/AnimatedPriceDisplay';
import { SkeuomorphicCoursePicker } from '../ui/SkeuomorphicCoursePicker';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS, Easing } from 'react-native-reanimated';
import { AnimatedTabs, TabData } from '../../reference/AnimatedTabs';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface PricingEditorScreenProps {
    courses: string[];
    initialGroupPrice: number;
    initialIndividualPrice: number;
    initialPerCoursePricing?: Record<string, { group: number; individual: number }>;
    initialSessionType?: 'online' | 'in-person' | 'both';
    onBack: () => void;
    onSave: (data: {
        applyToAll: boolean;
        globalGroupPrice: number;
        globalIndividualPrice: number;
        perCoursePricing: Record<string, { group: number; individual: number }>;
        sessionType: 'online' | 'in-person' | 'both';
    }) => void;
    isDarkMode?: boolean;
}

export function PricingEditorScreen({
    courses,
    initialGroupPrice,
    initialIndividualPrice,
    initialPerCoursePricing = {},
    initialSessionType = 'both',
    onBack,
    onSave,
    isDarkMode = false,
}: PricingEditorScreenProps) {
    const hasPerCoursePricing = Object.keys(initialPerCoursePricing).length > 0;

    const [applyToAll, setApplyToAll] = useState(!hasPerCoursePricing);
    const [selectedCourse, setSelectedCourse] = useState(courses[0] || '');
    const [perCoursePricing, setPerCoursePricing] = useState<Record<string, { group: number; individual: number }>>(
        initialPerCoursePricing
    );
    const sessionTypes: Array<'online' | 'in-person' | 'both'> = ['online', 'in-person', 'both'];
    const initialSessionIndex = sessionTypes.indexOf(initialSessionType) !== -1 ? sessionTypes.indexOf(initialSessionType) : 2;
    const [sessionTypeIndex, setSessionTypeIndex] = useState(initialSessionIndex);
    const sessionType = sessionTypes[sessionTypeIndex];

    // Tabs for AnimatedTabs
    const sessionTabs: TabData[] = useMemo(() => [
        { id: 'online', title: 'Online', content: <></> },
        { id: 'in-person', title: 'In-Person', content: <></> },
        { id: 'both', title: 'Both', content: <></> },
    ], []);

    // Middle default value for sliders (between 5 and 100, middle is ~50)
    const SLIDER_MIDDLE_DEFAULT = 50;

    // Store SEPARATE prices for each session type - each starts at middle default
    const [sessionTypePricing, setSessionTypePricing] = useState<
        Record<'online' | 'in-person' | 'both', { group: number; individual: number }>
    >({
        'online': { group: SLIDER_MIDDLE_DEFAULT, individual: SLIDER_MIDDLE_DEFAULT },
        'in-person': { group: SLIDER_MIDDLE_DEFAULT, individual: SLIDER_MIDDLE_DEFAULT },
        'both': { group: SLIDER_MIDDLE_DEFAULT, individual: SLIDER_MIDDLE_DEFAULT },
    });

    // Get prices for CURRENT session type
    const globalGroupPrice = sessionTypePricing[sessionType].group;
    const globalIndividualPrice = sessionTypePricing[sessionType].individual;

    const currentGroupPrice = applyToAll
        ? globalGroupPrice
        : perCoursePricing[selectedCourse]?.group ?? globalGroupPrice;
    const currentIndividualPrice = applyToAll
        ? globalIndividualPrice
        : perCoursePricing[selectedCourse]?.individual ?? globalIndividualPrice;

    const handleGroupPriceChange = (newValue: number) => {
        if (applyToAll) {
            setSessionTypePricing(prev => ({
                ...prev,
                [sessionType]: { ...prev[sessionType], group: newValue }
            }));
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
            setSessionTypePricing(prev => ({
                ...prev,
                [sessionType]: { ...prev[sessionType], individual: newValue }
            }));
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
            sessionType,
        });
    };

    // Swipe gesture handler
    const translateX = useSharedValue(0);

    const swipeGesture = Gesture.Pan()
        .activeOffsetX([10, 10])
        .onUpdate((e) => {
            if (e.translationX > 0) {
                translateX.value = e.translationX;
            }
        })
        .onEnd((e) => {
            if (e.translationX > 80 || e.velocityX > 400) {
                translateX.value = withTiming(
                    SCREEN_WIDTH,
                    { duration: 250, easing: Easing.out(Easing.cubic) },
                    () => {
                        runOnJS(onBack)();
                    }
                );
            } else {
                translateX.value = withTiming(0, { duration: 200, easing: Easing.out(Easing.cubic) });
            }
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    return (
        <GestureDetector gesture={swipeGesture}>
            <Animated.View style={[styles.container, animatedStyle, isDarkMode && styles.containerDark]}>
                <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={onBack} style={styles.backButton}>
                            <ArrowLeft size={24} color={isDarkMode ? '#fff' : '#000'} />
                        </TouchableOpacity>
                        <Text style={[styles.headerTitle, isDarkMode && styles.textDark]}>Edit Pricing</Text>
                    </View>

                    {/* Session Type Toggle - with AnimatedTabs */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, isDarkMode && styles.textDark]}>Session Type</Text>
                        <AnimatedTabs
                            tabs={sessionTabs}
                            activeTabIndex={sessionTypeIndex}
                            onTabChange={setSessionTypeIndex}
                            variant="pill"
                            isDarkMode={isDarkMode}
                        />
                    </View>

                    {/* Apply to All Checkbox */}
                    <TouchableOpacity
                        onPress={() => setApplyToAll(!applyToAll)}
                        style={[styles.checkboxRow, isDarkMode && styles.checkboxRowDark]}
                    >
                        <View style={[styles.checkbox, applyToAll && styles.checkboxChecked]}>
                            {applyToAll && <Check size={14} color="white" />}
                        </View>
                        <View style={styles.checkboxLabel}>
                            <Text style={[styles.checkboxTitle, isDarkMode && styles.textDark]}>Apply to all courses</Text>
                            <Text style={[styles.checkboxSubtitle, isDarkMode && styles.textGrayDark]}>Use same pricing for all courses</Text>
                        </View>
                    </TouchableOpacity>

                    {/* Course Selector (if not applying to all) */}
                    {!applyToAll && courses.length > 0 && (
                        <View style={styles.section}>
                            <Text style={[styles.sectionSubtitle, isDarkMode && styles.textDark]}>Select Course</Text>
                            <SkeuomorphicCoursePicker
                                courses={courses}
                                selectedValue={selectedCourse}
                                onValueChange={(itemValue: string) => setSelectedCourse(itemValue)}
                                placeholder="Select a course"
                                isDarkMode={isDarkMode}
                            />
                        </View>
                    )}

                    {/* Group Session Pricing */}
                    <View style={styles.pricingSection}>
                        <Text style={[styles.pricingTitle, isDarkMode && styles.textDark]}>Group Session Pricing</Text>
                        <View style={styles.priceBubbleContainer}>
                            <View style={[styles.priceBubble, { backgroundColor: isDarkMode ? '#1e3a8a' : '#dbeafe' }]}>
                                <AnimatedPriceDisplay
                                    value={currentGroupPrice}
                                    color={isDarkMode ? '#93c5fd' : '#1d4ed8'} // blue-300 in DM, blue-700 in LM
                                    fontSize={30}
                                />
                            </View>
                        </View>
                        <View style={styles.sliderContainer}>
                            <View style={styles.sliderLabels}>
                                <Text style={styles.sliderLabel}>$2</Text>
                                <Text style={styles.sliderLabel}>$10</Text>
                            </View>
                            <AnimatedPricingSlider
                                min={2}
                                max={10}
                                step={1}
                                value={currentGroupPrice}
                                onValueChange={handleGroupPriceChange}
                                color="#3b82f6"
                                isDarkMode={isDarkMode}
                            />
                        </View>
                    </View>

                    {/* Individual Session Pricing */}
                    <View style={styles.pricingSection}>
                        <Text style={[styles.pricingTitle, isDarkMode && styles.textDark]}>1-on-1 Session Pricing</Text>
                        <View style={styles.priceBubbleContainer}>
                            <View style={[styles.priceBubble, { backgroundColor: isDarkMode ? '#14532d' : '#dcfce7' }]}>
                                <AnimatedPriceDisplay
                                    value={currentIndividualPrice}
                                    color={isDarkMode ? '#86efac' : '#15803d'} // green-300 in DM, green-700 in LM
                                    fontSize={30}
                                />
                            </View>
                        </View>
                        <View style={styles.sliderContainer}>
                            <View style={styles.sliderLabels}>
                                <Text style={styles.sliderLabel}>$10</Text>
                                <Text style={styles.sliderLabel}>$30</Text>
                            </View>
                            <AnimatedPricingSlider
                                min={10}
                                max={30}
                                step={1}
                                value={currentIndividualPrice}
                                onValueChange={handleIndividualPriceChange}
                                color="#22c55e"
                                isDarkMode={isDarkMode}
                            />
                        </View>
                    </View>

                    {/* Preview - Per Course Pricing */}
                    {!applyToAll && (
                        <View style={[styles.previewSection, isDarkMode && styles.previewSectionDark]}>
                            <Text style={[styles.previewTitle, isDarkMode && styles.textDark]}>Course-Specific Pricing</Text>
                            {courses.map((course) => {
                                const pricing = perCoursePricing[course] || {
                                    group: globalGroupPrice,
                                    individual: globalIndividualPrice,
                                };
                                return (
                                    <View key={course} style={styles.previewRow}>
                                        <Text style={[styles.previewCourse, isDarkMode && styles.textDark]}>{course}</Text>
                                        <View style={styles.previewPrices}>
                                            <Text style={styles.previewGroup}>Group: ${pricing.group}</Text>
                                            <Text style={[styles.previewDot, isDarkMode && styles.textGrayDark]}>•</Text>
                                            <Text style={styles.previewIndividual}>1-on-1: ${pricing.individual}</Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    )}
                </ScrollView>

                {/* Save Button */}
                <View style={[styles.saveButtonContainer, isDarkMode && styles.saveButtonContainerDark]}>
                    <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                        <Text style={styles.saveButtonText}>Save Pricing</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </GestureDetector>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollView: {
        flex: 1,
    },
    containerDark: {
        backgroundColor: '#111827',
    },
    textDark: {
        color: '#fff',
    },
    textGrayDark: {
        color: '#9ca3af',
    },
    checkboxRowDark: {
        backgroundColor: '#1f2937',
        borderColor: '#374151',
    },
    previewSectionDark: {
        backgroundColor: '#1f2937',
    },
    saveButtonContainerDark: {
        backgroundColor: '#111827',
        borderTopColor: '#374151',
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 24,
        paddingBottom: 100,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        position: 'relative',
    },
    backButton: {
        position: 'absolute',
        left: 0,
        zIndex: 10,
        padding: 8,
        marginLeft: -8,
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 16,
    },
    sectionSubtitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#111827',
        marginBottom: 8,
    },
    segmentedControl: {
        flexDirection: 'row',
        backgroundColor: '#f3f4f6',
        padding: 4,
        borderRadius: 12,
    },
    segmentButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    segmentButtonActive: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    segmentText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6b7280',
    },
    segmentTextActive: {
        color: '#111827',
    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        marginBottom: 24,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#d1d5db',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    checkboxChecked: {
        backgroundColor: '#dc2626',
        borderColor: '#dc2626',
    },
    checkboxLabel: {
        flex: 1,
    },
    checkboxTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#111827',
    },
    checkboxSubtitle: {
        fontSize: 14,
        color: '#6b7280',
    },
    pricingSection: {
        marginBottom: 40,
        paddingHorizontal: 8,
    },
    pricingTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 24,
        textAlign: 'center',
    },
    priceBubbleContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    priceBubble: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 999,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    sliderContainer: {
        paddingHorizontal: 8,
    },
    sliderLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
        paddingHorizontal: 4,
    },
    sliderLabel: {
        fontSize: 12,
        color: '#9ca3af',
        fontWeight: '500',
    },
    previewSection: {
        marginTop: 32,
        padding: 16,
        backgroundColor: '#f3f4f6',
        borderRadius: 12,
    },
    previewTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 12,
    },
    previewRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    previewCourse: {
        fontSize: 14,
        color: '#111827',
    },
    previewPrices: {
        flexDirection: 'row',
        gap: 8,
    },
    previewGroup: {
        fontSize: 14,
        color: '#dc2626',
    },
    previewDot: {
        fontSize: 14,
        color: '#6b7280',
    },
    previewIndividual: {
        fontSize: 14,
        color: '#15803d',
    },
    saveButtonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        backgroundColor: '#fff',
    },
    saveButton: {
        width: '100%',
        paddingVertical: 16,
        backgroundColor: '#dc2626',
        borderRadius: 999,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    saveButtonText: {
        textAlign: 'center',
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
