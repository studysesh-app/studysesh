import { useEffect, useRef, useState } from 'react';
import { Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { showAlert } from '../../lib/alert';
import { DEMO_MODE } from '../../lib/demo';

interface ReportUserModalProps {
    target: { id: string; name: string } | null;
    onClose: () => void;
    onSubmit: (id: string, reason: string) => Promise<string | null>;
    isDarkMode?: boolean;
}

export function ReportUserModal({ target, onClose, onSubmit, isDarkMode = false }: ReportUserModalProps) {
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const submittingRef = useRef(false);
    useEffect(() => { setReason(''); }, [target?.id]);

    const submit = async () => {
        if (!target || !reason.trim() || submittingRef.current) return;
        submittingRef.current = true;
        setSubmitting(true);
        try {
            const error = await onSubmit(target.id, reason.trim());
            if (error) {
                showAlert('Could not submit report', error);
                return;
            }
            onClose();
            showAlert(DEMO_MODE ? 'Demo report' : 'Report submitted',
                DEMO_MODE ? 'Reports are not sent in demo mode.' : 'Thanks. Your report is available for moderator review.');
        } catch (error) {
            console.error('Submit report failed:', error);
            showAlert('Could not submit report', error instanceof Error ? error.message : 'Please try again.');
        } finally {
            submittingRef.current = false;
            setSubmitting(false);
        }
    };

    return (
        <Modal visible={!!target} transparent animationType="fade" onRequestClose={() => { if (!submitting) onClose(); }}>
            <View className="flex-1 justify-center px-6 bg-black/50">
                <View className={`rounded-2xl p-5 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <Text className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Report {target?.name}
                    </Text>
                    <Text className="text-sm text-gray-500 mb-3">Describe what happened. Do not include passwords or sensitive information.</Text>
                    <TextInput
                        value={reason}
                        onChangeText={setReason}
                        editable={!submitting}
                        maxLength={1000}
                        multiline
                        placeholder="Reason for your report"
                        placeholderTextColor="#9ca3af"
                        textAlignVertical="top"
                        className={`min-h-[120px] border rounded-xl p-3 ${isDarkMode ? 'border-gray-700 text-white' : 'border-gray-200 text-gray-900'}`}
                    />
                    <Text className="text-xs text-gray-500 text-right mt-1">{reason.length}/1000</Text>
                    <View className="flex-row justify-end gap-5 mt-4">
                        <TouchableOpacity onPress={onClose} disabled={submitting}><Text className="text-gray-500">Cancel</Text></TouchableOpacity>
                        <TouchableOpacity onPress={submit} disabled={submitting || !reason.trim()}>
                            <Text className={submitting || !reason.trim() ? 'text-gray-400' : 'text-red-600 font-semibold'}>
                                {submitting ? 'Submitting...' : 'Submit report'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
