import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { User, Settings, BookOpen, LogOut, ChevronRight, Users, DollarSign } from 'lucide-react-native';

interface TutorProfileScreenProps {
    tutorName: string;
    tutorInitial: string;
    role: string;
    connectionsCount?: number;

    onEditProfile: () => void;
    onEditCourses: () => void;
    onEditPricing: () => void;
    onSettings: () => void;
    onConnections: () => void;
    onLogout: () => void;
    isDarkMode?: boolean;
}

export function TutorProfileScreen({
    tutorName,
    tutorInitial,
    role,
    connectionsCount = 0,
    onEditProfile,
    onEditCourses,
    onEditPricing,
    onSettings,
    onConnections,
    onLogout,
    isDarkMode = false
}: TutorProfileScreenProps) {
    const menuItems = [
        { icon: Users, label: 'Connections', onPress: onConnections, badge: connectionsCount > 0 ? connectionsCount : undefined },
        { icon: User, label: 'Edit Profile', onPress: onEditProfile },
        { icon: BookOpen, label: 'My Courses', onPress: onEditCourses },
        { icon: DollarSign, label: 'Pricing', onPress: onEditPricing },
        { icon: Settings, label: 'Settings', onPress: onSettings },
    ];

    const handleLogout = () => {
        Alert.alert(
            'Log Out',
            'Are you sure you want to log out?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Log Out', style: 'destructive', onPress: onLogout },
            ]
        );
    };

    return (
        <ScrollView className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
            <View style={styles.headerSection}>
                <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>{tutorInitial}</Text>
                </View>
                <Text style={[styles.nameText, isDarkMode && styles.textDark]}>{tutorName}</Text>
                <Text style={[styles.emailText, isDarkMode && styles.textGrayDark]}>3rd Year Computer Science</Text>

            </View>

            <View style={styles.menuContainer}>
                <View style={styles.menuList}>
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <TouchableOpacity
                                key={item.label}
                                onPress={item.onPress}
                                style={[styles.menuItem, isDarkMode && styles.menuItemDark]}
                                activeOpacity={0.8}
                            >
                                <View style={[styles.iconContainer, isDarkMode && styles.iconContainerDark]}>
                                    <Icon size={20} color="#db2321" />
                                </View>
                                <Text style={[styles.menuLabel, isDarkMode && styles.textDark]}>{item.label}</Text>
                                {item.badge && (
                                    <View style={styles.badgeContainer}>
                                        <Text style={styles.badgeText}>{item.badge}</Text>
                                    </View>
                                )}
                                <View style={[styles.chevronContainer, isDarkMode && styles.iconContainerDark]}>
                                    <ChevronRight size={16} color="#db2321" />
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <TouchableOpacity
                    onPress={handleLogout}
                    style={[styles.logoutButton, isDarkMode && styles.logoutButtonDark]}
                    activeOpacity={0.8}
                >
                    <LogOut size={20} color="#db2321" />
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    headerSection: {
        alignItems: 'center',
        paddingTop: 32,
        paddingBottom: 24,
    },
    avatarContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: '#fee2e2',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        shadowColor: '#db2321',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
        overflow: 'hidden',
    },
    avatarContainerDark: {
        backgroundColor: '#450a0a', // red-950
        shadowColor: '#000',
    },
    avatarText: {
        fontSize: 36,
        fontWeight: '700',
        color: '#991b1b', // red-800
    },
    nameText: {
        fontSize: 22,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
    },
    textDark: {
        color: 'white',
    },
    textGrayDark: {
        color: '#9ca3af',
    },
    emailText: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 12,
    },
    roleBadge: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        backgroundColor: '#fef2f2',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#f2d0d0',
    },
    roleBadgeDark: {
        backgroundColor: '#450a0a',
        borderColor: '#7f1d1d',
    },
    roleText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#db2321',
    },
    menuContainer: {
        padding: 16,
    },
    menuList: {
        gap: 12,
        marginBottom: 24,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 18,
        backgroundColor: '#fff',
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: '#f2d0d0',
        shadowColor: '#db2321',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    menuItemDark: {
        backgroundColor: '#1f2937',
        borderColor: '#374151',
        shadowColor: 'black',
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#fef2f2',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    iconContainerDark: {
        backgroundColor: '#450a0a',
    },
    menuLabel: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    chevronContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#fef2f2',
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeContainer: {
        backgroundColor: '#db2321',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
        marginRight: 8,
    },
    badgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 18,
        backgroundColor: '#fef2f2',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#fecaca',
    },
    logoutButtonDark: {
        backgroundColor: '#450a0a',
        borderColor: '#7f1d1d',
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#db2321',
        marginLeft: 8,
    },
});
