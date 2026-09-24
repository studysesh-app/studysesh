import { View, Text, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator } from 'react-native';
import { ArrowLeft, Upload, FileText, X, Check } from 'lucide-react-native';
import { useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import { SkeuomorphicCoursePicker } from '../ui/SkeuomorphicCoursePicker';
import { supabase } from '../../lib/supabase';
import { uploadTutorProof } from '../../lib/storage';

interface TutorProofUploadScreenProps {
    courses: string[];
    onBack: () => void;
    onContinue: (proofs: Record<string, string>) => void;
}

type UploadedFile = {
    course: string;
    fileName: string;
    fileType: string;
    path: string;
};

export function TutorProofUploadScreen({ courses, onBack, onContinue }: TutorProofUploadScreenProps) {
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [selectedCourse, setSelectedCourse] = useState(courses[0] || '');
    const [uploading, setUploading] = useState(false);

    const handleFileUpload = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            type: ['application/pdf', 'image/*'],
            copyToCacheDirectory: true,
        });
        if (result.canceled || !result.assets?.[0]) return;
        const asset = result.assets[0];

        const isPdf = asset.mimeType === 'application/pdf';
        const isImage = asset.mimeType?.startsWith('image/');
        if (!isPdf && !isImage) {
            Alert.alert('Unsupported File', 'Please select a PDF or an image file.');
            return;
        }

        setUploading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const path = await uploadTutorProof(user.id, selectedCourse, asset.uri);
            setUploadedFiles((prev) => [
                ...prev,
                {
                    course: selectedCourse,
                    fileName: asset.name || path.split('/').pop() || 'proof',
                    fileType: asset.mimeType || 'application/octet-stream',
                    path,
                },
            ]);
        } catch (e) {
            console.error('Proof upload error:', e);
            Alert.alert('Upload Failed', 'Could not upload the file. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const removeFile = (index: number) => {
        const file = uploadedFiles[index];
        setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
        if (file?.path) {
            supabase.storage.from('proofs').remove([file.path]).catch(() => {});
        }
    };

    const handleContinue = () => {
        const proofs: Record<string, string> = {};
        uploadedFiles.forEach((f) => {
            proofs[f.course] = f.path;
        });
        onContinue(proofs);
    };

    const getCourseFileCount = (course: string) => {
        return uploadedFiles.filter((f) => f.course === course).length;
    };

    const allCoursesHaveProof = courses.every((course) => getCourseFileCount(course) > 0);

    return (
        <View className="flex-1 bg-white dark:bg-gray-900">
            <ScrollView className="flex-1 px-4 pt-6">
                <View className="flex-row items-center mb-6 relative">
                    <TouchableOpacity onPress={onBack} className="absolute left-0 z-10 p-2 -ml-2">
                        <ArrowLeft size={24} color="#000" />
                    </TouchableOpacity>
                    <Text className="flex-1 text-center text-2xl font-bold text-gray-900 dark:text-white">
                        Upload Proof
                    </Text>
                </View>

                {/* Progress - Step 4 of 6 */}
                <View className="flex-row gap-2 mb-4">
                    <View className="flex-1 h-1 rounded-full bg-red-600" />
                    <View className="flex-1 h-1 rounded-full bg-red-600" />
                    <View className="flex-1 h-1 rounded-full bg-red-600" />
                    <View className="flex-1 h-1 rounded-full bg-red-600" />
                    <View className="flex-1 h-1 rounded-full bg-gray-200" />
                    <View className="flex-1 h-1 rounded-full bg-gray-200" />
                </View>
                <Text className="text-sm text-gray-500 mb-6">Step 4 of 6</Text>

                <Text className="text-base text-center text-gray-500 mb-6">
                    Upload proof of your success in each course
                </Text>

                {/* Info Message */}
                <View className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
                    <Text className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                        Accepted documents:
                    </Text>
                    <Text className="text-sm text-gray-500">• Unofficial transcripts</Text>
                    <Text className="text-sm text-gray-500">• Grade reports</Text>
                    <Text className="text-sm text-gray-500">• Course completion certificates</Text>
                </View>

                {/* Course Selector */}
                <View className="mb-6">
                    <Text className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Select Course
                    </Text>
                    <SkeuomorphicCoursePicker
                        courses={courses}
                        selectedValue={selectedCourse}
                        onValueChange={(itemValue: string) => setSelectedCourse(itemValue)}
                        placeholder="Select a course"
                        getItemLabel={(course) => `${course} ${getCourseFileCount(course) > 0 ? '✓' : ''}`}
                    />
                </View>

                {/* Upload Area */}
                <TouchableOpacity
                    onPress={handleFileUpload}
                    disabled={uploading}
                    className="mb-6 p-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl items-center justify-center bg-gray-50 dark:bg-gray-800"
                >
                    <View className="w-16 h-16 bg-red-50 rounded-full items-center justify-center mb-3">
                        {uploading ? (
                            <ActivityIndicator size="small" color="#db2321" />
                        ) : (
                            <Upload size={32} color="#db2321" />
                        )}
                    </View>
                    <Text className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                        {uploading ? 'Uploading…' : `Upload file for ${selectedCourse}`}
                    </Text>
                    <Text className="text-sm text-gray-500">
                        PDF, PNG, JPG up to 10MB
                    </Text>
                </TouchableOpacity>

                {/* Course Status Grid */}
                <View className="mb-6">
                    <Text className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                        Course Verification Status
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                        {courses.map((course) => {
                            const fileCount = getCourseFileCount(course);
                            const hasProof = fileCount > 0;
                            return (
                                <View
                                    key={course}
                                    className={`w-[48%] p-3 rounded-lg border-2 ${hasProof
                                        ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                                        }`}
                                >
                                    <View className="flex-row items-center justify-between mb-1">
                                        <Text className={`text-sm font-medium ${hasProof ? 'text-green-700 dark:text-green-400' : 'text-gray-900 dark:text-white'}`}>
                                            {course}
                                        </Text>
                                        {hasProof && <Check size={16} color="#16a34a" />}
                                    </View>
                                    <Text className={`text-xs ${hasProof ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                                        {hasProof ? `${fileCount} file${fileCount > 1 ? 's' : ''}` : 'No proof'}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                    <View className="mb-6">
                        <Text className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                            Uploaded Files ({uploadedFiles.length})
                        </Text>
                        <View className="gap-2">
                            {uploadedFiles.map((file, index) => (
                                <View
                                    key={index}
                                    className="flex-row items-center gap-3 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                                >
                                    <View className="w-10 h-10 bg-red-50 rounded-lg items-center justify-center">
                                        <FileText size={20} color="#db2321" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-sm font-medium text-gray-900 dark:text-white" numberOfLines={1}>
                                            {file.fileName}
                                        </Text>
                                        <Text className="text-xs text-gray-500">
                                            {file.course}
                                        </Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => removeFile(index)}
                                        className="p-2"
                                    >
                                        <X size={16} color="#9ca3af" />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

            </ScrollView>

            {/* Continue Button */}
            <View className="p-4 border-t border-gray-200 dark:border-gray-800">
                <TouchableOpacity
                    onPress={handleContinue}
                    className="w-full py-4 bg-red-600 rounded-full shadow-sm"
                >
                    <Text className="text-center text-white text-base font-semibold">
                        Continue
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
