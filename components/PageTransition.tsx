import { View } from 'react-native';
import { ReactNode } from 'react';

interface PageTransitionProps {
    children: ReactNode;
    keyProp?: string | number;
}

export function PageTransition({ children, keyProp }: PageTransitionProps) {
    return (
        <View className="flex-1" key={keyProp}>
            {children}
        </View>
    );
}
