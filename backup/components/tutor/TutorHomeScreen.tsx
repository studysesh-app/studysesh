import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Bell } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface TutorHomeScreenProps {
    tutorName: string;
    unreadNotifications: number;
    onNotificationsClick: () => void;
}

export function TutorHomeScreen({
    tutorName,
    unreadNotifications,
    onNotificationsClick,
}: TutorHomeScreenProps) {
    return (
        <ScrollView className="flex-1" style={{ backgroundColor: '#fff' }} contentContainerStyle={{ paddingBottom: 0 }}>
            {/* Gradient Header Card */}
            <View style={styles.headerContainer}>
                <LinearGradient
                    colors={['#db2321', '#500908']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientHeader}
                >
                    <View style={styles.headerContent}>
                        {/* Left Section - Welcome Text */}
                        <View style={styles.welcomeSection}>
                            <Text style={styles.welcomeText}>Welcome back,</Text>
                            <Text style={styles.userName}>{tutorName}</Text>
                        </View>

                        {/* Right Section - Notification Bell */}
                        <TouchableOpacity
                            style={styles.bellButton}
                            onPress={onNotificationsClick}
                            activeOpacity={0.7}
                        >
                            <View style={styles.bellContainer}>
                                <Bell size={24} color="white" />
                                {unreadNotifications > 0 && (
                                    <View style={styles.badge}>
                                        <Text style={styles.badgeText}>{unreadNotifications}</Text>
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </View>

            {/* Content area - currently empty */}
            <View style={styles.contentContainer}>
                {/* Future content will go here */}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        marginBottom: 24,
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    gradientHeader: {
        borderRadius: 24,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        padding: 24,
        minHeight: 140,
        justifyContent: 'center',
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flex: 1,
    },
    welcomeSection: {
        flex: 1,
        justifyContent: 'center',
    },
    welcomeText: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
        marginBottom: 4,
    },
    userName: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'white',
    },
    bellButton: {
        padding: 8,
    },
    bellContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: -4,
        right: -4,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#db2321',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'white',
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: 'white',
    },
    contentContainer: {
        paddingHorizontal: 16,
        paddingBottom: 100,
    },
});
