import { View, Text, Modal, TouchableOpacity } from 'react-native';

interface BookingConfirmationScreenProps {
    isOpen: boolean;
    onClose: () => void;
    booking: any;
    onConfirm: () => void;
    onCancel: () => void;
}

export function BookingConfirmationScreen({ isOpen, onClose, booking, onConfirm, onCancel }: BookingConfirmationScreenProps) {
    if (!booking) return null;

    return (
        <Modal visible={isOpen} animationType="fade" transparent>
            <View className="flex-1 bg-black/50 items-center justify-center p-4">
                <View className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-sm">
                    <Text className="text-xl font-bold mb-4 text-center">Confirm Booking</Text>
                    <Text className="text-center text-gray-600 dark:text-gray-400 mb-6">
                        Are you sure you want to book a session with {booking.tutorName}?
                    </Text>

                    <View className="flex-row gap-4">
                        <TouchableOpacity
                            onPress={onCancel}
                            className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 items-center"
                        >
                            <Text className="font-semibold text-gray-900 dark:text-white">Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={onConfirm}
                            className="flex-1 py-3 rounded-xl bg-red-600 items-center"
                        >
                            <Text className="font-semibold text-white">Confirm</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
