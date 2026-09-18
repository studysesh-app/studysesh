import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { X } from 'lucide-react-native';

interface TutorDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    tutor: any;
}

export function TutorDetailModal({ isOpen, onClose, tutor }: TutorDetailModalProps) {
    if (!tutor) return null;

    return (
        <Modal visible={isOpen} animationType="slide" presentationStyle="pageSheet">
            <View className="flex-1 bg-white dark:bg-gray-900">
                <View className="p-4 flex-row justify-between items-center border-b border-gray-200 dark:border-gray-800">
                    <Text className="text-lg font-bold">{tutor.name}</Text>
                    <TouchableOpacity onPress={onClose} className="p-2">
                        <X size={24} color="#000" />
                    </TouchableOpacity>
                </View>
                <ScrollView className="p-4">
                    <Text className="text-base text-gray-700 dark:text-gray-300">
                        {tutor.bio || "No bio available."}
                    </Text>
                    {/* Add more details here as needed */}
                </ScrollView>
            </View>
        </Modal>
    );
}
