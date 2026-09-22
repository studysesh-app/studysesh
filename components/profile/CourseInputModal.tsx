import { View, Text, TextInput, TouchableOpacity, Modal, KeyboardAvoidingView, Platform, FlatList, ActivityIndicator } from 'react-native';
import { X, Upload, Check, Search } from 'lucide-react-native';
import { useState, useEffect, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../lib/supabase';
import { DEMO_MODE, searchCoursesDemo } from '../../lib/demo';

export interface ProofFile {
    uri: string;
    courseCode: string;
}

interface CourseInputModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (courseCode: string) => void;
    requiresProof?: boolean;
    onProofUpload?: (file: ProofFile) => void;
    isDarkMode?: boolean;
}

interface CourseResult {
    id: string;
    code: string;
    name: string;
}

export function CourseInputModal({ isOpen, onClose, onAdd, requiresProof, onProofUpload, isDarkMode = false }: CourseInputModalProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState<CourseResult[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<CourseResult | null>(null);
    const [searching, setSearching] = useState(false);
    const [proofUploaded, setProofUploaded] = useState(false);

    // Also keep manual input as fallback
    const [prefix, setPrefix] = useState('');
    const [suffix, setSuffix] = useState('');
    const [mode, setMode] = useState<'search' | 'manual'>('search');

    // Search courses from Supabase
    useEffect(() => {
        if (searchQuery.length < 2) {
            setResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            setSearching(true);
            const q = searchQuery.trim();

            if (DEMO_MODE) {
                setResults(searchCoursesDemo(q));
                setSearching(false);
                return;
            }

            const { data, error } = await supabase
                .from('courses')
                .select('id, code, name')
                .or(`code.ilike.%${q}%,name.ilike.%${q}%`)
                .limit(20)
                .order('code');

            if (!error && data) {
                setResults(data);
            }
            setSearching(false);
        }, 300); // debounce

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handlePrefixChange = (value: string) => {
        const letters = value.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 4);
        setPrefix(letters);
    };

    const handleSuffixChange = (value: string) => {
        const numbers = value.replace(/[^0-9]/g, '').slice(0, 4);
        setSuffix(numbers);
    };

    const handleFileUpload = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.7,
        });
        if (result.canceled || !result.assets?.[0]) return;

        const courseCode = selectedCourse?.code || (prefix.length >= 3 && suffix.length === 4 ? `${prefix} ${suffix}` : null);
        if (!courseCode) return;

        if (onProofUpload) {
            onProofUpload({ uri: result.assets[0].uri, courseCode });
            setProofUploaded(true);
        }
    };

    const handleAdd = () => {
        if (mode === 'search' && selectedCourse) {
            if (requiresProof && !proofUploaded) {
                alert('Please upload proof of course enrollment');
                return;
            }
            onAdd(selectedCourse.code);
            resetAndClose();
        } else if (mode === 'manual' && prefix.length >= 3 && suffix.length === 4) {
            if (requiresProof && !proofUploaded) {
                alert('Please upload proof of course enrollment');
                return;
            }
            onAdd(`${prefix} ${suffix}`);
            resetAndClose();
        }
    };

    const resetAndClose = () => {
        setSearchQuery('');
        setResults([]);
        setSelectedCourse(null);
        setPrefix('');
        setSuffix('');
        setProofUploaded(false);
        onClose();
    };

    const isValid = mode === 'search'
        ? !!selectedCourse
        : prefix.length >= 3 && suffix.length === 4;

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
                <View className={`w-full max-w-sm rounded-2xl p-6 shadow-xl ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
                    {/* Header */}
                    <View className="flex-row items-center justify-between mb-6">
                        <Text className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Add Course
                        </Text>
                        <TouchableOpacity onPress={onClose} className="p-2 -mr-2">
                            <X size={20} color={isDarkMode ? '#9ca3af' : '#9ca3af'} />
                        </TouchableOpacity>
                    </View>

                    {/* Search Input */}
                    <View className="mb-4">
                        <Text className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Search Courses
                        </Text>
                        <View className="relative">
                            <View className="absolute left-3 top-3 z-10">
                                <Search size={18} color="#9ca3af" />
                            </View>
                            <TextInput
                                value={searchQuery}
                                onChangeText={(text) => {
                                    setSearchQuery(text);
                                    setSelectedCourse(null);
                                    setMode('search');
                                }}
                                placeholder="Type course code or name..."
                                placeholderTextColor="#9ca3af"
                                autoCapitalize="characters"
                                className={`w-full pl-10 pr-4 py-3 border rounded-xl ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                            />
                        </View>
                    </View>

                    {/* Search Results */}
                    {searching && (
                        <View className="items-center py-3">
                            <ActivityIndicator size="small" color="#db2321" />
                        </View>
                    )}
                    {results.length > 0 && !selectedCourse && (
                        <View className={`mb-4 max-h-40 border rounded-xl overflow-hidden ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <FlatList
                                data={results}
                                keyExtractor={(item) => item.id}
                                keyboardShouldPersistTaps="handled"
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        onPress={() => {
                                            setSelectedCourse(item);
                                            setSearchQuery(item.code);
                                        }}
                                        className={`px-3 py-2.5 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'}`}
                                    >
                                        <Text className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                            {item.code}
                                        </Text>
                                        <Text className="text-xs text-gray-500" numberOfLines={1}>
                                            {item.name}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    )}
                    {selectedCourse && (
                        <View className={`mb-4 px-3 py-2.5 rounded-xl flex-row items-center justify-between ${isDarkMode ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-200'}`}>
                            <View className="flex-1">
                                <Text className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {selectedCourse.code}
                                </Text>
                                <Text className="text-xs text-gray-500" numberOfLines={1}>
                                    {selectedCourse.name}
                                </Text>
                            </View>
                            <Check size={18} color="#16a34a" />
                        </View>
                    )}
                    {searchQuery.length > 0 && results.length === 0 && !searching && !selectedCourse && (
                        <Text className="text-xs text-gray-500 mb-4 text-center">
                            No courses found. Try a different search.
                        </Text>
                    )}

                    {/* Proof Upload (Tutor only) */}
                    {requiresProof && (
                        <View className="mb-6">
                            <Text className={`text-sm font-medium mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Course Enrollment Proof
                            </Text>
                            <TouchableOpacity
                                onPress={handleFileUpload}
                                className={`px-4 py-3 border-2 border-dashed rounded-xl flex-row items-center justify-center gap-2 ${proofUploaded
                                    ? isDarkMode ? 'border-green-800 bg-green-900/20' : 'border-green-600 bg-green-50'
                                    : isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-gray-50'
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
                            className={`flex-1 py-3 rounded-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}
                        >
                            <Text className={`text-center font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Cancel
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleAdd}
                            disabled={!isValid || (requiresProof && !proofUploaded)}
                            className={`flex-1 py-3 rounded-full ${!isValid || (requiresProof && !proofUploaded)
                                ? isDarkMode ? 'bg-gray-700' : 'bg-gray-300'
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
