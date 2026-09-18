import { View, Text, TouchableOpacity, ScrollView, StyleSheet, TextInput, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { ArrowLeft, Heart, MessageCircle, Send, CircleHelp } from 'lucide-react-native';
import { useState, useRef } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS, Easing } from 'react-native-reanimated';

const SCREEN_WIDTH = Dimensions.get('window').width;

type PostType = 'post' | 'question';

interface Comment {
    id: string;
    authorName: string;
    authorInitial: string;
    authorYear: string;
    timestamp: string;
    content: string;
    likes: number;
    isLiked: boolean;
}

interface PostDetailScreenProps {
    postId: string;
    authorName: string;
    authorInitial: string;
    authorYear: string;
    timestamp: string;
    content: string;
    likes: number;
    comments: Comment[];
    isLiked: boolean;
    type: PostType;
    onBack: () => void;
    onLikePost: () => void;
    onLikeComment: (commentId: string) => void;
    onAddComment: (content: string) => void;
    onViewProfile?: (tutorId: string) => void;
    isDarkMode?: boolean;
}

export function PostDetailScreen({
    postId,
    authorName,
    authorInitial,
    authorYear,
    timestamp,
    content,
    likes,
    comments,
    isLiked,
    type,
    onBack,
    onLikePost,
    onLikeComment,
    onAddComment,
    onViewProfile,
    isDarkMode = false,
}: PostDetailScreenProps) {
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const scrollViewRef = useRef<ScrollView>(null);
    const inputRef = useRef<TextInput>(null);

    // Swipe gesture for back navigation
    const translateX = useSharedValue(0);

    const swipeGesture = Gesture.Pan()
        .activeOffsetX([10, 10])
        .onUpdate((event) => {
            if (event.translationX > 0) {
                translateX.value = event.translationX;
            }
        })
        .onEnd((event) => {
            if (event.translationX > 80 || event.velocityX > 400) {
                // Animate smoothly off screen, then call onBack
                translateX.value = withTiming(
                    SCREEN_WIDTH,
                    { duration: 250, easing: Easing.out(Easing.cubic) },
                    () => {
                        runOnJS(onBack)();
                    }
                );
            } else {
                // Snap back
                translateX.value = withTiming(0, { duration: 200, easing: Easing.out(Easing.cubic) });
            }
        });

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    const handleSubmitComment = () => {
        if (newComment.trim()) {
            onAddComment(newComment.trim());
            setNewComment('');
            setReplyingTo(null);
        }
    };

    const handleReply = (commentAuthor: string) => {
        setReplyingTo(commentAuthor);
        setNewComment(`@${commentAuthor} `);
        inputRef.current?.focus();
    };

    return (
        <GestureDetector gesture={swipeGesture}>
            <Animated.View style={[styles.container, animatedStyle, isDarkMode && styles.containerDark]}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 47.5 : 0}
                >
                    {/* Header */}
                    <View style={[styles.header, isDarkMode && styles.headerDark]}>
                        <TouchableOpacity onPress={onBack} style={styles.backButton}>
                            <ArrowLeft size={24} color={isDarkMode ? '#fff' : '#000'} />
                        </TouchableOpacity>
                        <Text style={[styles.headerTitle, isDarkMode && styles.textDark]}>Post</Text>
                        <View style={styles.headerSpacer} />
                    </View>

                    <ScrollView
                        ref={scrollViewRef}
                        style={styles.scrollView}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Original Post */}
                        <View style={[styles.postCard, isDarkMode && styles.postCardDark, type === 'question' && (isDarkMode ? styles.postCardQuestionDark : styles.postCardQuestion)]}>
                            {/* Question Tag */}
                            {type === 'question' && (
                                <View style={[styles.postQuestionTag, isDarkMode && styles.postQuestionTagDark]}>
                                    <CircleHelp size={12} color="#db2321" />
                                    <Text style={styles.postQuestionTagText}>QUESTION</Text>
                                </View>
                            )}

                            {/* Author Row */}
                            <TouchableOpacity
                                style={styles.postAuthor}
                                onPress={() => {
                                    if (onViewProfile) onViewProfile(authorName);
                                }}
                            >
                                <View style={styles.authorAvatar}>
                                    <Text style={styles.authorInitial}>{authorInitial}</Text>
                                </View>
                                <View style={styles.authorInfo}>
                                    <Text style={[styles.authorName, isDarkMode && styles.textDark]}>{authorName}</Text>
                                    <Text style={styles.authorMeta}>{authorYear} • {timestamp}</Text>
                                </View>
                            </TouchableOpacity>

                            {/* Content */}
                            <Text style={[styles.postContent, isDarkMode && styles.textGray200]}>{content}</Text>

                            {/* Actions */}
                            <View style={[styles.postFooter, isDarkMode && styles.borderTopDark]}>
                                <TouchableOpacity style={styles.postAction} onPress={onLikePost}>
                                    <Heart
                                        size={20}
                                        color={isLiked ? '#db2321' : '#9ca3af'}
                                        fill={isLiked ? '#db2321' : 'transparent'}
                                    />
                                    <Text style={[styles.actionText, isLiked && styles.actionTextActive]}>
                                        {likes}
                                    </Text>
                                </TouchableOpacity>
                                <View style={styles.postAction}>
                                    <MessageCircle size={20} color="#9ca3af" />
                                    <Text style={styles.actionText}>{comments.length}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Comments Section */}
                        <View style={styles.commentsSection}>
                            <Text style={[styles.commentsHeader, isDarkMode && styles.textDark]}>
                                Comments ({comments.length})
                            </Text>

                            {comments.length === 0 ? (
                                <View style={styles.emptyComments}>
                                    <Text style={styles.emptyText}>No comments yet</Text>
                                    <Text style={styles.emptySubtext}>Be the first to comment!</Text>
                                </View>
                            ) : (
                                <View style={styles.commentsList}>
                                    {comments.map((comment) => (
                                        <View key={comment.id} style={[styles.commentCard, isDarkMode && styles.commentCardDark]}>
                                            <View style={styles.commentAuthor}>
                                                <View style={styles.commentAvatar}>
                                                    <Text style={styles.commentAvatarText}>
                                                        {comment.authorInitial}
                                                    </Text>
                                                </View>
                                                <View style={styles.commentInfo}>
                                                    <Text style={[styles.commentName, isDarkMode && styles.textDark]}>{comment.authorName}</Text>
                                                    <Text style={styles.commentMeta}>
                                                        {comment.authorYear} • {comment.timestamp}
                                                    </Text>
                                                </View>
                                            </View>
                                            <Text style={[styles.commentContent, isDarkMode && styles.textGray200]}>{comment.content}</Text>
                                            <View style={styles.commentActions}>
                                                <TouchableOpacity
                                                    style={styles.commentAction}
                                                    onPress={() => handleReply(comment.authorName)}
                                                >
                                                    <Text style={styles.replyButtonText}>Reply</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={styles.commentAction}
                                                    onPress={() => onLikeComment(comment.id)}
                                                >
                                                    <Heart
                                                        size={16}
                                                        color={comment.isLiked ? '#db2321' : '#9ca3af'}
                                                        fill={comment.isLiked ? '#db2321' : 'transparent'}
                                                    />
                                                    <Text style={[
                                                        styles.commentLikeText,
                                                        comment.isLiked && styles.commentLikeTextActive
                                                    ]}>
                                                        {comment.likes}
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    </ScrollView>

                    {/* Comment Input - Fixed at bottom */}
                    <View style={[styles.commentInputContainer, isDarkMode && styles.commentInputContainerDark]}>
                        <View style={[styles.inputWrapper, isDarkMode && styles.inputWrapperDark]}>
                            <ScrollView
                                style={styles.inputScrollView}
                                contentContainerStyle={styles.inputScrollContent}
                                showsVerticalScrollIndicator={true}
                                keyboardShouldPersistTaps="handled"
                                nestedScrollEnabled={true}
                            >
                                <TextInput
                                    ref={inputRef}
                                    style={[styles.commentInput, isDarkMode && styles.textDark]}
                                    placeholder="Write a comment..."
                                    placeholderTextColor={isDarkMode ? '#6b7280' : '#9ca3af'}
                                    value={newComment}
                                    onChangeText={setNewComment}
                                    multiline
                                    maxLength={500}
                                    scrollEnabled={false}
                                    textAlignVertical="top"
                                    returnKeyType="default"
                                />
                            </ScrollView>
                            <Text style={styles.charCount}>{newComment.length}/500</Text>
                        </View>
                        <TouchableOpacity
                            style={[styles.sendButton, !newComment.trim() && styles.sendButtonDisabled]}
                            onPress={handleSubmitComment}
                            disabled={!newComment.trim()}
                        >
                            <Send size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Animated.View>
        </GestureDetector>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
    },
    headerSpacer: {
        width: 32,
    },
    scrollView: {
        flex: 1,
    },
    // Post Card
    postCard: {
        margin: 16,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 16,
        padding: 16,
    },
    postCardQuestion: {
        backgroundColor: '#fef7f7',
        borderColor: '#fecaca',
    },
    postQuestionTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#fee2e2',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 12,
    },
    postQuestionTagText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#db2321',
        letterSpacing: 0.5,
    },
    postAuthor: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    authorAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#fee2e2',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    authorInitial: {
        fontSize: 18,
        fontWeight: '600',
        color: '#991b1b',
    },
    authorInfo: {
        flex: 1,
    },
    authorName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    authorMeta: {
        fontSize: 13,
        color: '#9ca3af',
        marginTop: 2,
    },
    postContent: {
        fontSize: 16,
        color: '#374151',
        lineHeight: 24,
        marginBottom: 16,
    },
    postFooter: {
        flexDirection: 'row',
        gap: 24,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
    },
    postAction: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    actionText: {
        fontSize: 15,
        color: '#9ca3af',
        fontWeight: '500',
    },
    actionTextActive: {
        color: '#db2321',
    },
    // Comments Section
    commentsSection: {
        paddingHorizontal: 16,
    },
    commentsHeader: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 16,
    },
    emptyComments: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    emptyText: {
        fontSize: 15,
        color: '#6b7280',
        fontWeight: '500',
    },
    emptySubtext: {
        fontSize: 13,
        color: '#9ca3af',
        marginTop: 4,
    },
    commentsList: {
        gap: 12,
    },
    commentCard: {
        backgroundColor: '#f9fafb',
        borderRadius: 12,
        padding: 14,
    },
    commentAuthor: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    commentAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#fee2e2',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    commentAvatarText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#991b1b',
    },
    commentInfo: {
        flex: 1,
    },
    commentName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
    },
    commentMeta: {
        fontSize: 12,
        color: '#9ca3af',
    },
    commentContent: {
        fontSize: 14,
        color: '#374151',
        lineHeight: 20,
        marginBottom: 8,
    },
    commentLike: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    commentLikeText: {
        fontSize: 13,
        color: '#9ca3af',
    },
    commentLikeTextActive: {
        color: '#db2321',
    },
    commentActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    commentAction: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    replyButtonText: {
        fontSize: 13,
        color: '#6b7280',
        fontWeight: '500',
    },
    // Comment Input
    commentInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        gap: 10,
    },
    inputWrapper: {
        flex: 1,
        backgroundColor: '#f3f4f6',
        borderRadius: 20,
        overflow: 'hidden',
    },
    inputScrollView: {
        maxHeight: 150,
        minHeight: 44,
    },
    inputScrollContent: {
        flexGrow: 1,
    },
    commentInput: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        paddingTop: 10,
        fontSize: 15,
        color: '#374151',
        lineHeight: 22,
        minHeight: 44,
    },
    charCount: {
        fontSize: 11,
        color: '#9ca3af',
        textAlign: 'right',
        paddingRight: 14,
        paddingBottom: 6,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#db2321',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sendButtonDisabled: {
        backgroundColor: '#fecaca',
    },
    // Dark Mode
    containerDark: {
        backgroundColor: '#111827',
    },
    headerDark: {
        borderBottomColor: '#1f2937',
    },
    textDark: {
        color: '#f3f4f6',
    },
    textGray200: {
        color: '#e5e7eb',
    },
    postCardDark: {
        backgroundColor: '#1f2937',
        borderColor: '#374151',
    },
    postCardQuestionDark: {
        backgroundColor: '#450a0a',
        borderColor: '#7f1d1d',
    },
    postQuestionTagDark: {
        backgroundColor: '#7f1d1d', // Slightly lighter than bg?
    },
    borderTopDark: {
        borderTopColor: '#374151',
    },
    commentCardDark: {
        backgroundColor: '#1f2937',
    },
    commentInputContainerDark: {
        backgroundColor: '#111827',
        borderTopColor: '#1f2937',
    },
    inputWrapperDark: {
        backgroundColor: '#1f2937',
    },
});
