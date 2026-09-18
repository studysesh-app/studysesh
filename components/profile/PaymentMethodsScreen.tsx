import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { ArrowLeft, CreditCard, Plus, Trash2 } from 'lucide-react-native';
import { useState } from 'react';

interface PaymentMethod {
    id: string;
    type: 'card' | 'paypal';
    last4?: string;
    brand?: string;
    email?: string;
}

interface PaymentMethodsScreenProps {
    paymentMethods: PaymentMethod[];
    onBack: () => void;
    onRemove: (methodId: string) => void;
    onAddPaymentMethod: () => void;
}

export function PaymentMethodsScreen({
    paymentMethods: initialMethods,
    onBack,
    onRemove,
    onAddPaymentMethod,
}: PaymentMethodsScreenProps) {
    const [paymentMethods, setPaymentMethods] = useState(initialMethods);

    const handleRemove = (methodId: string) => {
        Alert.alert(
            'Remove Payment Method',
            'Are you sure you want to remove this payment method?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => {
                        setPaymentMethods(paymentMethods.filter((m) => m.id !== methodId));
                        onRemove(methodId);
                    },
                },
            ]
        );
    };

    return (
        <View className="flex-1 bg-white dark:bg-gray-900">
            {/* Header */}
            <View className="flex-row items-center px-4 py-4 border-b border-gray-200 dark:border-gray-800 pt-12">
                <TouchableOpacity onPress={onBack} className="p-2 -ml-2">
                    <ArrowLeft size={24} color="#000" />
                </TouchableOpacity>
                <Text className="flex-1 text-center text-xl font-bold pr-10 text-gray-900 dark:text-white">
                    Payment Methods
                </Text>
            </View>

            <ScrollView className="flex-1 px-4 py-6">
                {paymentMethods.length === 0 ? (
                    <View className="items-center justify-center py-16">
                        <View className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mb-4">
                            <CreditCard size={32} color="#9ca3af" />
                        </View>
                        <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-center">
                            No payment methods
                        </Text>
                        <Text className="text-sm text-gray-500 text-center max-w-xs">
                            Add a payment method to book sessions
                        </Text>
                    </View>
                ) : (
                    <View className="gap-3 mb-6">
                        {paymentMethods.map((method) => (
                            <View
                                key={method.id}
                                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex-row items-center gap-3"
                            >
                                {/* Icon */}
                                <View className="w-12 h-12 rounded-xl bg-red-50 items-center justify-center">
                                    <CreditCard size={24} color="#db2321" />
                                </View>

                                {/* Details */}
                                <View className="flex-1">
                                    {method.type === 'card' ? (
                                        <>
                                            <Text className="text-base font-medium text-gray-900 dark:text-white">
                                                {method.brand} •••• {method.last4}
                                            </Text>
                                            <Text className="text-sm text-gray-500">
                                                Credit Card
                                            </Text>
                                        </>
                                    ) : (
                                        <>
                                            <Text className="text-base font-medium text-gray-900 dark:text-white">
                                                PayPal
                                            </Text>
                                            <Text className="text-sm text-gray-500">
                                                {method.email}
                                            </Text>
                                        </>
                                    )}
                                </View>

                                {/* Remove Button */}
                                <TouchableOpacity
                                    onPress={() => handleRemove(method.id)}
                                    className="p-2"
                                >
                                    <Trash2 size={20} color="#ef4444" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>

            {/* Add Payment Method Button */}
            <View className="p-4 border-t border-gray-200 dark:border-gray-800">
                <TouchableOpacity
                    onPress={onAddPaymentMethod}
                    className="w-full py-4 bg-red-600 rounded-full shadow-sm flex-row items-center justify-center gap-2"
                >
                    <Plus size={20} color="white" />
                    <Text className="text-white text-base font-semibold">
                        Add Payment Method
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
