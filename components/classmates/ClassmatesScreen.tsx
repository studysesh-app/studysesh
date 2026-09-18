import { View, Text, StyleSheet, Dimensions, Alert, ToastAndroid, Platform } from 'react-native';
import { useState, useRef } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Carousel, { ICarouselInstance } from 'react-native-reanimated-carousel';
import { ProfileCard } from './ProfileCard';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ClassmateProfile {
    id: string;
    name: string;
    pronouns: string;
    year: string;
    major: string;
    photoUrl?: string;
    sharedCourses?: string[];
    gender: 'Man' | 'Woman' | 'Non-Binary' | 'Prefer not to say';
    prompts: Array<{ prompt: string; answer: string }>;
}

interface ClassmatesScreenProps {
    profiles: ClassmateProfile[];
    currentUserGender: 'Man' | 'Woman' | 'Non-Binary' | 'Prefer not to say';
    onConnect: (profileId: string) => void;
    onViewProfile?: (profile: ClassmateProfile) => void;
    connectedProfiles: Set<string>;
    friends: Set<string>;
    onBlock: (id: string) => void;
    onDisconnect: (id: string) => void;
    isDarkMode?: boolean;
}

export function ClassmatesScreen({
    profiles,
    currentUserGender,
    onConnect,
    onViewProfile,
    connectedProfiles,
    friends,
    onBlock,
    onDisconnect,
    isDarkMode = false,
}: ClassmatesScreenProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    // connectedProfiles state is now lifted up
    const carouselRef = useRef<ICarouselInstance>(null);

    const showToast = (message: string) => {
        if (Platform.OS === 'android') {
            ToastAndroid.show(message, ToastAndroid.SHORT);
        } else {
            Alert.alert('', message, [{ text: 'OK' }], { cancelable: true });
        }
    };

    const canViewProfile = (profile: ClassmateProfile) => {
        // Women and Non-Binary profiles can only be viewed by other Women or Non-Binary users
        if (profile.gender === 'Woman' || profile.gender === 'Non-Binary') {
            if (currentUserGender === 'Woman' || currentUserGender === 'Non-Binary') {
                return true;
            }
            return false;
        }
        // Men and "Prefer not to say" profiles are visible to everyone
        return true;
    };

    const handleProfileTap = (profile: ClassmateProfile) => {
        if (!canViewProfile(profile)) {
            showToast("You can't view this profile");
            return;
        }
        onViewProfile?.(profile);
    };

    const handleConnect = (profile: ClassmateProfile) => {
        const isAlreadyConnected = connectedProfiles.has(profile.id);

        // Notify parent to toggle connection
        onConnect(profile.id);

        // Auto-advance only on connect (not unrequest)
        if (!isAlreadyConnected) {
            setTimeout(() => {
                carouselRef.current?.next();
            }, 1200);
        }
    };

    if (profiles.length === 0) {
        return (
            <View style={styles.container}>
                <View style={styles.emptyState}>
                    <Text style={styles.emptyTitle}>No classmates yet</Text>
                    <Text style={styles.emptySubtitle}>
                        Check back later to discover students in your courses
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <GestureHandlerRootView style={[styles.container, isDarkMode ? styles.containerDark : styles.containerLight]}>
            <Carousel
                ref={carouselRef}
                loop={false}
                vertical={true}
                width={SCREEN_WIDTH}
                height={SCREEN_HEIGHT}
                data={profiles}
                scrollAnimationDuration={500}
                onSnapToItem={(index) => setCurrentIndex(index)}
                renderItem={({ item: profile, index }) => (
                    <View style={styles.cardWrapper}>
                        <ProfileCard
                            name={profile.name}
                            pronouns={profile.pronouns}
                            year={profile.year}
                            major={profile.major}
                            photoUrl={profile.photoUrl}
                            sharedCourses={profile.sharedCourses}
                            prompts={profile.prompts}
                            isConnected={connectedProfiles.has(profile.id)}
                            isFriend={friends.has(profile.id)}
                            onConnect={() => handleConnect(profile)}
                            onProfileTap={() => handleProfileTap(profile)}
                            onBlock={() => onBlock(profile.id)}
                            onDisconnect={() => onDisconnect(profile.id)}
                            isDarkMode={isDarkMode}
                        />
                    </View>
                )}
            />
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: '#f8f9fa', // set effectively dynamically via style prop or here?
        // Actually better to use style prop in component
    },
    containerLight: {
        backgroundColor: '#f8f9fa',
    },
    containerDark: {
        backgroundColor: '#111827',
    },
    cardWrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
        paddingBottom: 170, // Increased to shift center point much higher
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#374151',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 15,
        color: '#6b7280',
        textAlign: 'center',
        lineHeight: 22,
    },
});
