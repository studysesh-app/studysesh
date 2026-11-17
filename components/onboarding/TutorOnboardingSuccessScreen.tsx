import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Clock } from 'lucide-react-native';
import { RippleBackground } from '../RippleBackground';
import { LinearGradient } from 'expo-linear-gradient';

interface TutorOnboardingSuccessScreenProps {
    onComplete: () => void;
}

export function TutorOnboardingSuccessScreen({ onComplete }: TutorOnboardingSuccessScreenProps) {
    return (
        <RippleBackground>
            <View className="flex-1 items-center justify-center px-6">
                {/* Pending Icon */}
                <View className="mb-8">
                    <View className="w-24 h-24 bg-white/20 rounded-full items-center justify-center">
                        <Clock size={56} color="white" />
                    </View>
                </View>

                {/* Success Message */}
                <Text className="text-white text-3xl font-bold text-center mb-3">
                    Ready to Finish
                </Text>

                <Text className="text-white/90 text-base text-center mb-4 max-w-xs">
                    Finish setting up your account to publish your tutoring courses.
                </Text>

                <Text className="text-white/80 text-sm text-center mb-12 max-w-xs">
                    Listings are approved automatically. Proof may be reviewed by an administrator.
                </Text>

                {/* Continue Button */}
                <TouchableOpacity
                    onPress={onComplete}
                    style={styles.buttonWrapper}
                    activeOpacity={0.95}
                >
                    <LinearGradient
                        colors={['#ffffff', '#f5f5f5', '#e8e8e8']}
                        style={styles.button}
                    >
                        <Text style={styles.buttonText}>
                            Finish Setup
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </RippleBackground>
    );
}

const styles = StyleSheet.create({
    buttonWrapper: {
        width: '100%',
        maxWidth: 400,
    },
    button: {
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 16,
        borderWidth: 2,
        borderTopWidth: 2,
        borderBottomWidth: 2,
        borderLeftWidth: 2,
        borderRightWidth: 2,
        borderTopColor: 'rgba(255, 255, 255, 0.9)',
        borderLeftColor: 'rgba(255, 255, 255, 0.7)',
        borderRightColor: 'rgba(0, 0, 0, 0.08)',
        borderBottomColor: 'rgba(0, 0, 0, 0.15)',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 10,
        },
        shadowOpacity: 0.5,
        shadowRadius: 25,
        elevation: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#db2321',
        textShadowColor: 'rgba(255, 255, 255, 0.8)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 1,
    },
});
