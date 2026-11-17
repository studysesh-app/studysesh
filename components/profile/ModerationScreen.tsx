import { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { showAlert, showConfirm } from '../../lib/alert';
import { timeAgo } from '../../lib/time';
import type { ModerationReport } from '../../hooks/useModeration';

interface ModerationScreenProps {
    reports: ModerationReport[];
    loading: boolean;
    loadingMore: boolean;
    error: string | null;
    hasMore: boolean;
    onBack: () => void;
    onRefresh: () => void;
    onLoadMore: () => void;
    onResolve: (id: string, decision: 'reviewed' | 'dismissed') => Promise<string | null>;
    isDarkMode?: boolean;
}

export function ModerationScreen({
    reports, loading, loadingMore, error, hasMore, onBack, onRefresh, onLoadMore, onResolve, isDarkMode = false,
}: ModerationScreenProps) {
    const [resolving, setResolving] = useState<string | null>(null);
    useEffect(() => { onRefresh(); }, [onRefresh]);

    const confirmResolution = (report: ModerationReport, decision: 'reviewed' | 'dismissed') => {
        showConfirm({
            title: decision === 'reviewed' ? 'Mark reviewed' : 'Dismiss report',
            message: 'This closes the report and records your decision. It does not change the reported account.',
            confirmText: decision === 'reviewed' ? 'Mark reviewed' : 'Dismiss',
            onConfirm: async () => {
                if (resolving) return;
                setResolving(report.id);
                try {
                    const failure = await onResolve(report.id, decision);
                    if (failure) showAlert('Could not resolve report', failure);
                } finally {
                    setResolving(null);
                }
            },
        });
    };

    return (
        <View className={`flex-1 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
            <View className="flex-row items-center px-4 py-4">
                <TouchableOpacity onPress={onBack} accessibilityRole="button" accessibilityLabel="Back">
                    <ArrowLeft size={24} color={isDarkMode ? '#fff' : '#111827'} />
                </TouchableOpacity>
                <Text className={`flex-1 text-center text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Report Review
                </Text>
                <TouchableOpacity onPress={onRefresh} disabled={loading}>
                    <Text className="text-red-600 font-semibold">Refresh</Text>
                </TouchableOpacity>
            </View>
            <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 100 }}>
                <Text className="text-sm text-gray-500 mb-4">
                    Decisions close reports and are audited. They do not automatically suspend or delete accounts.
                </Text>
                {loading && reports.length === 0 && <Text className="text-gray-500">Loading reports...</Text>}
                {error && (
                    <View className="mb-4">
                        <Text className="text-red-600">{error}</Text>
                        <TouchableOpacity onPress={reports.length > 0 ? onLoadMore : onRefresh} className="py-2">
                            <Text className="text-red-600 font-semibold">Try again</Text>
                        </TouchableOpacity>
                    </View>
                )}
                {!loading && !error && reports.length === 0 && <Text className="text-gray-500">No open reports.</Text>}
                {reports.map((report) => (
                    <View key={report.id} className={`rounded-xl border p-4 mb-3 ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
                        <Text className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Reported: {report.reported_name ?? 'Unavailable user'}
                        </Text>
                        <Text className="text-xs text-gray-500" selectable>{report.reported_id}</Text>
                        <Text className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            From {report.reporter_name ?? 'Unavailable user'} · {timeAgo(report.created_at)}
                        </Text>
                        <Text className={`mt-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {report.reason || 'No reason provided.'}
                        </Text>
                        <View className="flex-row gap-4 mt-4">
                            <TouchableOpacity disabled={!!resolving} onPress={() => confirmResolution(report, 'reviewed')}>
                                <Text className="text-red-600 font-semibold">{resolving === report.id ? 'Saving...' : 'Mark reviewed'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity disabled={!!resolving} onPress={() => confirmResolution(report, 'dismissed')}>
                                <Text className="text-gray-500 font-semibold">Dismiss</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
                {hasMore && !error && (
                    <TouchableOpacity onPress={onLoadMore} disabled={loadingMore} className="items-center py-4">
                        <Text className="text-red-600 font-semibold">{loadingMore ? 'Loading...' : 'Load more reports'}</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </View>
    );
}
