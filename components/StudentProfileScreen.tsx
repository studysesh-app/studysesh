import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { User, Settings, BookOpen, LogOut, ChevronRight, Users } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface StudentProfileScreenProps {
    name: string;
    email: string;
    role: string;
    connectionsCount?: number;
    onEditProfile: () => void;
    onMyCourses: () => void;
    onConnections?: () => void;
    onSettings: () => void;
    onLogout: () => void;
    isDarkMode?: boolean;
}

export function StudentProfileScreen({
    name,
    email,
    role,
    connectionsCount = 0,
    onEditProfile,
    onMyCourses,
    onConnections,
    onSettings,
    onLogout,
    isDarkMode = false
}: StudentProfileScreenProps) {
    const menuItems = [
        { icon: Users, label: 'Connections', onPress: onConnections, badge: connectionsCount > 0 ? connectionsCount : undefined },
        { icon: User, label: 'Edit Profile', onPress: onEditProfile },
        { icon: BookOpen, label: 'My Courses', onPress: onMyCourses },
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
                    <Text style={styles.avatarText}>{name.charAt(0)}</Text>
                </View>
                <Text style={[styles.nameText, isDarkMode && styles.textDark]}>{name}</Text>
                <Text style={[styles.emailText, isDarkMode && styles.textGrayDark]}>{email}</Text>
                <View style={[styles.roleBadge, isDarkMode && styles.roleBadgeDark]}>
                    <Text style={styles.roleText}>{role}</Text>
                </View>
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
    avatarText: {
        fontSize: 36,
        fontWeight: '700',
        color: '#991b1b',
    },
    nameText: {
        fontSize: 22,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 4,
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
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#fef2f2',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
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
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 18,
        borderRadius: 16,
        backgroundColor: '#fef2f2',
        borderWidth: 1.5,
        borderColor: '#f2d0d0',
        shadowColor: '#db2321',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 2,
    },
    logoutText: {
        marginLeft: 10,
        fontSize: 16,
        fontWeight: '600',
        color: '#db2321',
    },
    textDark: {
        color: '#f3f4f6',
    },
    textGrayDark: {
        color: '#9ca3af',
    },
    menuItemDark: {
        backgroundColor: '#1f2937',
        borderColor: '#374151',
    },
    iconContainerDark: {
        backgroundColor: '#374151',
    },
    logoutButtonDark: {
        backgroundColor: '#450a0a',
        borderColor: '#7f1d1d',
    },
    roleBadgeDark: {
        backgroundColor: '#450a0a',
        borderColor: '#7f1d1d',
    },
});
