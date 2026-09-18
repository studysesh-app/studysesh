import { View, Text, TextInput, TouchableOpacity, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { X, Upload, Check } from 'lucide-react-native';
import { useState } from 'react';

interface CourseInputModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (courseCode: string) => void;
    requiresProof?: boolean;
    onProofUpload?: (file: any) => void;
}

export function CourseInputModal({ isOpen, onClose, onAdd, requiresProof, onProofUpload }: CourseInputModalProps) {
    const [prefix, setPrefix] = useState('');
    const [suffix, setSuffix] = useState('');
    const [proofUploaded, setProofUploaded] = useState(false);

    const handlePrefixChange = (value: string) => {
        const letters = value.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 4);
        setPrefix(letters);
    };

    const handleSuffixChange = (value: string) => {
        const numbers = value.replace(/[^0-9]/g, '').slice(0, 4);
        setSuffix(numbers);
    };

    const handleFileUpload = () => {
        // Mock file upload
        if (onProofUpload) {
            onProofUpload({ name: 'proof.pdf' });
            setProofUploaded(true);
        }
    };

    const handleAdd = () => {
        if (prefix.length === 4 && suffix.length === 4) {
            if (requiresProof && !proofUploaded) {
                alert('Please upload proof of course enrollment');
                return;
            }
            onAdd(`${prefix} ${suffix}`);
            setPrefix('');
            setSuffix('');
            setProofUploaded(false);
            onClose();
        }
    };

    const isValid = prefix.length === 4 && suffix.length === 4;

    return (
        <Modal
            visible={isOpen}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1 justify-center items-center bg-black/50 px-4"
            >
                <View className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-xl">
                    {/* Header */}
                    <View className="flex-row items-center justify-between mb-6">
                        <Text className="text-lg font-bold text-gray-900 dark:text-white">
                            Add Course
                        </Text>
                        <TouchableOpacity onPress={onClose} className="p-2 -mr-2">
                            <X size={20} color="#9ca3af" />
                        </TouchableOpacity>
                    </View>

                    {/* Input Fields */}
                    <View className="mb-6">
                        <Text className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Course Code
                        </Text>
                        <View className="flex-row gap-2">
                            <TextInput
                                value={prefix}
                                onChangeText={handlePrefixChange}
                                placeholder="SYSC"
                                placeholderTextColor="#9ca3af"
                                textAlignVertical="center"
                                includeFontPadding={false}
                                style={{ paddingVertical: 12, lineHeight: 20 }}
                                className="flex-1 px-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-center text-lg font-semibold text-gray-900 dark:text-white uppercase"
                                maxLength={4}
                            />
                            <TextInput
                                value={suffix}
                                onChangeText={handleSuffixChange}
                                placeholder="4101"
                                placeholderTextColor="#9ca3af"
                                keyboardType="numeric"
                                textAlignVertical="center"
                                includeFontPadding={false}
                                style={{ paddingVertical: 12, lineHeight: 20 }}
                                className="flex-1 px-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-center text-lg font-semibold text-gray-900 dark:text-white"
                                maxLength={4}
                            />
                        </View>
                        <Text className="mt-2 text-xs text-gray-500">
                            Enter 4 letters + 4 numbers (e.g., SYSC 4101)
                        </Text>
                    </View>

                    {/* Proof Upload (Tutor only) */}
                    {requiresProof && (
                        <View className="mb-6">
                            <Text className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                Course Enrollment Proof
                            </Text>
                            <TouchableOpacity
                                onPress={handleFileUpload}
                                className={`px-4 py-3 border-2 border-dashed rounded-xl flex-row items-center justify-center gap-2 ${proofUploaded
                                        ? 'border-green-600 bg-green-50 dark:bg-green-900/20'
                                        : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                                    }`}
                            >
                                {proofUploaded ? (
                                    <>
                                        <Check size={16} color="#16a34a" />
                                        <Text className="text-green-600 text-sm font-medium">Proof uploaded</Text>
                                    </>
                                ) : (
                                    <>
                                        <Upload size={16} color="#9ca3af" />
                                        <Text className="text-gray-500 text-sm">Upload screenshot or PDF</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Action Buttons */}
                    <View className="flex-row gap-3">
                        <TouchableOpacity
                            onPress={onClose}
                            className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 rounded-full"
                        >
                            <Text className="text-center text-gray-900 dark:text-white font-semibold">
                                Cancel
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleAdd}
                            disabled={!isValid || (requiresProof && !proofUploaded)}
                            className={`flex-1 py-3 rounded-full ${!isValid || (requiresProof && !proofUploaded)
                                    ? 'bg-gray-300 dark:bg-gray-700'
                                    : 'bg-red-600'
                                }`}
                        >
                            <Text className="text-center text-white font-semibold">
                                Add Course
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}
