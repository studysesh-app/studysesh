import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useState } from 'react';
import { Send } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ChatInputProps {
    onSend: (message: string) => void;
    placeholder?: string;
    isDarkMode?: boolean;
}

export function ChatInput({ onSend, placeholder = 'Type a message...', isDarkMode = false }: ChatInputProps) {
    const [message, setMessage] = useState('');
    const insets = useSafeAreaInsets();

    const handleSend = () => {
        if (message.trim()) {
            onSend(message.trim());
            setMessage('');
        }
    };

    return (
        <View
            className={`${isDarkMode ? 'bg-gray-900' : 'bg-white'} px-4 pt-2`}
            style={{ paddingBottom: 8 }}
        >
            <View className="flex-row items-center gap-3">
                <View className={`flex-1 flex-row items-center ${isDarkMode ? 'bg-gray-800' : 'bg-[#f2f2f7]'} rounded-[20px] px-4 min-h-[38px]`}>
                    <TextInput
                        value={message}
                        onChangeText={setMessage}
                        placeholder={placeholder}
                        placeholderTextColor={isDarkMode ? '#9ca3af' : '#8E8E93'}
                        multiline
                        className={`flex-1 text-[17px] ${isDarkMode ? 'text-white' : 'text-black'} max-h-32 py-2`}
                        style={{ lineHeight: 22 }}
                    />
                </View>

                <TouchableOpacity
                    onPress={handleSend}
                    disabled={!message.trim()}
                    className={`w-10 h-10 rounded-full items-center justify-center overflow-hidden ${!message.trim() ? 'opacity-50' : ''}`}
                    style={message.trim() ? styles.sendButton : undefined}
                >
                    {message.trim() ? (
                        <LinearGradient
                            colors={['#db2321', '#a01a18']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 0, y: 1 }}
                            style={StyleSheet.absoluteFill}
                        />
                    ) : (
                        <View className={`absolute w-full h-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`} />
                    )}
                    <Send size={18} color={message.trim() ? 'white' : '#9ca3af'} style={{ marginLeft: 2 }} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    sendButton: {
        shadowColor: '#db2321',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    sendButtonDisabled: {
        // No special styling for disabled state
    },
});
