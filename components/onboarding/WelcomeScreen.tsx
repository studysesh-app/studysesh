import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ZeroGravityTutorCards } from '../ZeroGravityTutorCards';
import { AnimatedButton } from '../AnimatedButton';

interface WelcomeScreenProps {
    onGetStarted: () => void;
    onSignIn: () => void;
}

function WelcomeContent({ onGetStarted, onSignIn }: WelcomeScreenProps) {
    return (
        <View className="flex-1 items-center justify-center px-6">
            {/* App Name */}
            <Text className="text-5xl font-bold mb-3 tracking-tighter text-white">
                studysesh
            </Text>

            {/* Tagline */}
            <Text className="text-lg text-center mb-8 max-w-xs text-white/90">
                Connect with top students. Master your courses. Excel together.
            </Text>

            {/* Get Started Button */}
            <View className="w-full max-w-sm mb-4">
                <AnimatedButton
                    onPress={onGetStarted}
                    title="Get Started"
                    variant="primary"
                />
            </View>

            {/* Sign In Link */}
            <TouchableOpacity onPress={onSignIn}>
                <Text className="text-sm text-white/80">
                    Already have an account? <Text className="font-semibold text-white">Sign In</Text>
                </Text>
            </TouchableOpacity>
        </View>
    );
}

export function WelcomeScreen({ onGetStarted, onSignIn }: WelcomeScreenProps) {
    return (
        <ZeroGravityTutorCards>
            <WelcomeContent onGetStarted={onGetStarted} onSignIn={onSignIn} />
        </ZeroGravityTutorCards>
    );
}
