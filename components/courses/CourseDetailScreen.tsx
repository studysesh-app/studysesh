import { View, Text, TouchableOpacity, ScrollView, StyleSheet, TextInput, Dimensions } from 'react-native';
import { ArrowLeft, Send, MessageCircle, MessageSquare, Heart } from 'lucide-react-native';
// Missing icons: Image, Link, HelpCircle
import { useState, useEffect } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS, Easing } from 'react-native-reanimated';
import { TutorCard } from '../TutorCard';
import { AnimatedTabs, TabData } from '../../reference/AnimatedTabs';
import { PostDetailScreen } from './PostDetailScreen';

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

interface BoardPost {
    id: string;
    authorName: string;
    authorInitial: string;
    authorYear: string;
    timestamp: string;
    content: string;
    likes: number;
    comments: number;
    isLiked: boolean;
    type: PostType;
}

interface CourseTutor {
    id: string;
    name: string;
    courses: string[];
    pronouns: string;
    groupPrice: string | null;
    individualPrice: string | null;
    location: string[];
}

interface CourseDetailScreenProps {
    courseCode: string;
    posts: BoardPost[];
    tutors: CourseTutor[];
    activeCount: number;
    studentCount: number;
    onBack: () => void;
    onCreatePost: (content: string, type: PostType) => void;
    onLikePost: (postId: string) => void;
    onCommentPost: (postId: string) => void;
    onMessageTutor: (tutorId: string) => void;
    onViewProfile?: (tutorId: string) => void;
    isDarkMode?: boolean;
}

export function CourseDetailScreen({
    courseCode,
    posts,
    tutors,
    activeCount,
    studentCount,
    onBack,
    onCreatePost,
    onLikePost,
    onCommentPost,
    onMessageTutor,
    onViewProfile,
    isDarkMode = false,
}: CourseDetailScreenProps) {
    const [activeTabIndex, setActiveTabIndex] = useState(0);
    const [newPostContent, setNewPostContent] = useState('');
    const [isQuestion, setIsQuestion] = useState(false);
    const [selectedPost, setSelectedPost] = useState<BoardPost | null>(null);

    // Mock comments for the selected post
    const [mockComments] = useState<Comment[]>([
        {
            id: 'c1',
            authorName: 'Alex Kim',
            authorInitial: 'A',
            authorYear: '3rd Year',
            timestamp: '1h ago',
            content: 'I have the notes! DM me and I can share them with you.',
            likes: 3,
            isLiked: false,
        },
        {
            id: 'c2',
            authorName: 'Jordan Lee',
            authorInitial: 'J',
            authorYear: '2nd Year',
            timestamp: '45m ago',
            content: 'The prof posted the slides on Brightspace, check the announcements!',
            likes: 5,
            isLiked: true,
        },
    ]);

    // Swipe gesture for back navigation and tab switching
    const translateX = useSharedValue(0);
    const activeIndexSV = useSharedValue(0);
    const startX = useSharedValue(0);

    useEffect(() => {
        activeIndexSV.value = activeTabIndex;
    }, [activeTabIndex]);

    const swipeGesture = Gesture.Pan()
        .activeOffsetX([-20, 20]) // Detect horizontal swipes
        .onStart((event) => {
            startX.value = event.x;
        })
        .onUpdate((event) => {
            // Allow Back Swipe (dragging right) if:
            // 1. On Board tab (Index 0)
            // 2. On Tutors tab (Index 1) BUT starting from edge (Edge Swipe)
            if (event.translationX > 0) {
                if (activeIndexSV.value === 0) {
                    translateX.value = event.translationX;
                } else if (activeIndexSV.value === 1 && startX.value < 70) {
                    translateX.value = event.translationX;
                }
            }
        })
        .onEnd((event) => {
            if (activeIndexSV.value === 0) {
                if (event.translationX > 80 || event.velocityX > 800) {
                    // Back Navigation
                    translateX.value = withTiming(
                        SCREEN_WIDTH,
                        { duration: 250, easing: Easing.out(Easing.cubic) },
                        () => {
                            runOnJS(onBack)();
                        }
                    );
                } else if (event.translationX < -40) {
                    // Switch to Tutors (Swipe Left)
                    runOnJS(setActiveTabIndex)(1);
                    translateX.value = withTiming(0); // Ensure reset
                } else {
                    // Snap back
                    translateX.value = withTiming(0, { duration: 200, easing: Easing.out(Easing.cubic) });
                }
            } else if (activeIndexSV.value === 1) {
                if (event.translationX > 0) {
                    if (startX.value < 70 && (event.translationX > 80 || event.velocityX > 800)) {
                        // Edge Swipe -> Back
                        translateX.value = withTiming(
                            SCREEN_WIDTH,
                            { duration: 250, easing: Easing.out(Easing.cubic) },
                            () => {
                                runOnJS(onBack)();
                            }
                        );
                    } else if (startX.value >= 70 && event.translationX > 40) {
                        // Middle Swipe -> Switch to Board (Swipe Right)
                        runOnJS(setActiveTabIndex)(0);
                        translateX.value = withTiming(0);
                    } else {
                        // Snap back
                        translateX.value = withTiming(0, { duration: 200, easing: Easing.out(Easing.cubic) });
                    }
                }
            }
        });


    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    const handleSubmitPost = () => {
        if (newPostContent.trim()) {
            onCreatePost(newPostContent.trim(), isQuestion ? 'question' : 'post');
            setNewPostContent('');
            setIsQuestion(false);
        }
    };

    const handlePostPress = (post: BoardPost) => {
        setSelectedPost(post);
    };

    // No longer conditionally returning - we render both and overlay PostDetailScreen

    const renderBoardContent = () => (
        <View>
            {/* Composer */}
            <View style={[styles.composer, isDarkMode && styles.composerDark]}>
                <TextInput
                    style={[styles.composerInput, isDarkMode && styles.textDark]}
                    placeholder="Share with your classmates..."
                    placeholderTextColor={isDarkMode ? '#6b7280' : '#9ca3af'}
                    value={newPostContent}
                    onChangeText={setNewPostContent}
                    multiline
                />

                {/* Composer Actions */}
                <View style={styles.composerActions}>
                    <View style={styles.composerLeftActions}>

                        <TouchableOpacity
                            style={[
                                styles.questionTag,
                                isDarkMode && styles.questionTagDark,
                                isQuestion && styles.questionTagActive,
                                isDarkMode && isQuestion && { backgroundColor: 'rgba(127, 29, 29, 0.4)', borderColor: '#ef4444' }
                            ]}
                            onPress={() => setIsQuestion(!isQuestion)}
                        >
                            {/* <CircleHelp size={16} color={isQuestion ? '#db2321' : '#6b7280'} /> */}
                            <Text style={[
                                styles.questionTagText,
                                isQuestion && styles.questionTagTextActive,
                                isDarkMode && isQuestion && { color: '#fca5a5' }
                            ]}>
                                Question
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.postButton,
                            !newPostContent.trim() && styles.postButtonDisabled,
                            !newPostContent.trim() && isDarkMode && styles.postButtonDisabledDark
                        ]}
                        onPress={handleSubmitPost}
                        disabled={!newPostContent.trim()}
                    >
                        <Send size={16} color="#fff" />
                        <Text style={styles.postButtonText}>Post</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Posts List */}
            <View style={styles.postsList}>
                {posts.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MessageSquare size={48} color="#d1d5db" />
                        <Text style={[styles.emptyTitle, isDarkMode && styles.textDark]}>No posts yet</Text>
                        <Text style={styles.emptySubtitle}>
                            Be the first to ask a question or start a discussion!
                        </Text>
                    </View>
                ) : (
                    posts.map((post) => (
                        <TouchableOpacity
                            key={post.id}
                            onPress={() => handlePostPress(post)}
                            activeOpacity={0.8}
                            style={[
                                styles.postCard,
                                isDarkMode && styles.postCardDark,
                                post.type === 'question' && (isDarkMode ? styles.postCardQuestionDark : styles.postCardQuestion),
                            ]}
                        >
                            {/* Question Tag */}
                            {post.type === 'question' && (
                                <View style={styles.postQuestionTag}>
                                    {/* <CircleHelp size={12} color="#db2321" /> */}
                                    <Text style={styles.postQuestionTagText}>QUESTION</Text>
                                </View>
                            )}

                            {/* Author Row */}
                            <TouchableOpacity
                                style={styles.postAuthor}
                                onPress={(e) => {
                                    e.stopPropagation(); // Prevent opening post detail
                                    if (onViewProfile) onViewProfile(post.authorName);
                                }}
                            >
                                <View style={styles.authorAvatar}>
                                    <Text style={styles.authorInitial}>{post.authorInitial}</Text>
                                </View>
                                <View style={styles.authorInfo}>
                                    <Text style={[styles.authorName, isDarkMode && styles.textDark]}>{post.authorName}</Text>
                                    <Text style={styles.authorMeta}>{post.authorYear} • {post.timestamp}</Text>
                                </View>
                            </TouchableOpacity>

                            {/* Content */}
                            <Text style={[styles.postContent, isDarkMode && styles.textGray200]}>{post.content}</Text>

                            {/* Actions */}
                            <View style={styles.postFooter}>
                                <TouchableOpacity
                                    style={styles.postAction}
                                    onPress={(e) => {
                                        e.stopPropagation();
                                        onLikePost(post.id);
                                    }}
                                >
                                    <Heart
                                        size={18}
                                        color={post.isLiked ? '#db2321' : '#9ca3af'}
                                        fill={post.isLiked ? '#db2321' : 'transparent'}
                                    />
                                    <Text style={[styles.actionText, post.isLiked && styles.actionTextActive]}>
                                        {post.likes}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.postAction}
                                    onPress={(e) => {
                                        e.stopPropagation();
                                        handlePostPress(post);
                                    }}
                                >
                                    <MessageCircle size={18} color="#9ca3af" />
                                    <Text style={styles.actionText}>{post.comments}</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    ))
                )}
            </View>
        </View >
    );

    const renderTutorsContent = () => (
        <View>
            {tutors.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={{ fontSize: 48 }}>👨‍🏫</Text>
                    <Text style={[styles.emptyTitle, isDarkMode && styles.textDark]}>No tutors yet</Text>
                    <Text style={styles.emptySubtitle}>
                        No tutors are available for this course right now
                    </Text>
                </View>
            ) : (
                <View style={styles.tutorsList}>
                    {tutors.map((tutor) => (
                        <TutorCard
                            key={tutor.id}
                            name={tutor.name}
                            courses={tutor.courses}
                            pronouns={tutor.pronouns}
                            groupPrice={tutor.groupPrice}
                            individualPrice={tutor.individualPrice}
                            location={tutor.location}
                            onClick={() => onViewProfile ? onViewProfile(tutor.id) : onMessageTutor(tutor.id)}
                            showMessageButton={true}
                            onMessagePress={() => onMessageTutor(tutor.id)}
                            isDarkMode={isDarkMode}
                        />
                    ))}
                </View>
            )}
        </View>
    );

    const tabs: TabData[] = [
        { id: 'board', title: 'The Board', content: null },
        { id: 'tutors', title: 'Tutors', content: null },
    ];

    return (
        <View style={styles.rootContainer}>
            {/* Base CourseDetailScreen content - always rendered */}
            <GestureDetector gesture={swipeGesture}>
                <Animated.View style={[styles.container, animatedStyle, isDarkMode && styles.containerDark]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={onBack} style={styles.backButton}>
                            <ArrowLeft size={24} color={isDarkMode ? '#fff' : '#000'} />
                        </TouchableOpacity>
                        <Text style={styles.headerCourseCode}>{courseCode}</Text>
                        <View style={styles.headerSpacer} />
                    </View>

                    {/* Stats Bar */}
                    <View style={styles.statsBar}>
                        <View style={styles.statItem}>
                            <View style={styles.statDot} />
                            <Text style={[styles.statText, isDarkMode && styles.textGrayDark]}>{activeCount} active</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statIcon}>👥</Text>
                            <Text style={[styles.statText, isDarkMode && styles.textGrayDark]}>{studentCount} students</Text>
                        </View>
                    </View>

                    {/* Main Content with Animated Tabs */}
                    <ScrollView
                        style={styles.scrollView}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Tabs - narrower width */}
                        <View style={styles.tabsWrapper}>
                            <AnimatedTabs
                                tabs={tabs}
                                activeTabIndex={activeTabIndex}
                                onTabChange={setActiveTabIndex}
                                variant="pill"
                                isDarkMode={isDarkMode}
                            />
                        </View>

                        {/* Content - full width */}
                        <View style={styles.contentWrapper}>
                            {activeTabIndex === 0 ? renderBoardContent() : renderTutorsContent()}
                        </View>
                    </ScrollView>
                </Animated.View>
            </GestureDetector>

            {/* PostDetailScreen overlay - rendered on top when a post is selected */}
            {selectedPost && (
                <View style={styles.overlayContainer}>
                    <PostDetailScreen
                        postId={selectedPost.id}
                        authorName={selectedPost.authorName}
                        authorInitial={selectedPost.authorInitial}
                        authorYear={selectedPost.authorYear}
                        timestamp={selectedPost.timestamp}
                        content={selectedPost.content}
                        likes={selectedPost.likes}
                        comments={mockComments}
                        isLiked={selectedPost.isLiked}
                        type={selectedPost.type}
                        onBack={() => setSelectedPost(null)}
                        onLikePost={() => onLikePost(selectedPost.id)}
                        onLikeComment={(commentId) => console.log('Like comment:', commentId)}
                        onAddComment={(content) => console.log('Add comment:', content)}
                        onViewProfile={onViewProfile}
                        isDarkMode={isDarkMode}
                    />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    rootContainer: {
        flex: 1,
        backgroundColor: 'transparent', // Transparent so home content shows through during swipe
    },
    container: {
        flex: 1,
        backgroundColor: '#fff', // The actual screen content has white background
    },
    overlayContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'transparent', // Transparent so underlying content shows through during swipe
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 4,
    },
    backButton: {
        padding: 4,
    },
    headerCourseCode: {
        fontSize: 18,
        fontWeight: '700',
        color: '#db2321',
    },
    headerSpacer: {
        width: 32,
    },
    statsBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        paddingTop: 2,
        paddingBottom: 8,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#22c55e',
    },
    statIcon: {
        fontSize: 14,
    },
    statText: {
        fontSize: 13,
        color: '#6b7280',
    },
    scrollView: {
        flex: 1,
    },
    tabsWrapper: {
        paddingHorizontal: 40,
        marginTop: 8,
        marginBottom: 12,
    },
    contentWrapper: {
        paddingHorizontal: 16,
    },
    // Composer Styles
    composer: {
        backgroundColor: '#fff',
        borderWidth: 1.5, // Increased visibility
        borderColor: '#d1d5db', // Slightly darker for visibility
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    composerInput: {
        fontSize: 15,
        color: '#374151',
        minHeight: 60,
        textAlignVertical: 'top',
    },
    composerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 12,
        paddingTop: 12,
        // Removed awkward white line (borderTopWidth)
    },
    composerLeftActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    composerIconBtn: {
        padding: 8,
    },
    composerDivider: {
        width: 1,
        height: 24,
        backgroundColor: '#e5e7eb',
        marginHorizontal: 4,
    },
    questionTag: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    questionTagActive: {
        backgroundColor: '#fef2f2',
        borderColor: '#fecaca',
    },
    questionTagText: {
        fontSize: 13,
        fontWeight: '500',
        color: '#6b7280',
    },
    questionTagTextActive: {
        color: '#db2321',
    },
    postButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#db2321',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
    },
    postButtonDisabled: {
        backgroundColor: '#fecaca',
    },
    postButtonDisabledDark: {
        backgroundColor: '#450a0a',
        opacity: 0.6,
    },
    postButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#fff',
    },
    // Posts Styles
    postsList: {
        gap: 12,
    },
    postCard: {
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
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fee2e2',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    authorInitial: {
        fontSize: 16,
        fontWeight: '600',
        color: '#991b1b',
    },
    authorInfo: {
        flex: 1,
    },
    authorName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111827',
    },
    authorMeta: {
        fontSize: 13,
        color: '#9ca3af',
        marginTop: 1,
    },
    postContent: {
        fontSize: 15,
        color: '#374151',
        lineHeight: 22,
        marginBottom: 14,
    },
    postFooter: {
        flexDirection: 'row',
        gap: 20,
    },
    postAction: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    actionText: {
        fontSize: 14,
        color: '#9ca3af',
    },
    actionTextActive: {
        color: '#db2321',
    },
    // Empty State
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#374151',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        lineHeight: 20,
    },
    // Tutors
    tutorsList: {
        gap: 12,
    },
    // Dark Mode
    containerDark: {
        backgroundColor: '#111827',
    },
    textDark: {
        color: '#f3f4f6',
    },
    textGrayDark: {
        color: '#9ca3af',
    },
    textGray200: {
        color: '#e5e7eb',
    },
    composerDark: {
        backgroundColor: '#1f2937',
        borderColor: '#374151',
    },
    dividerDark: {
        backgroundColor: '#374151',
    },
    questionTagDark: {
        borderColor: '#374151',
    },
    postCardDark: {
        backgroundColor: '#1f2937',
        borderColor: '#374151',
    },
    postCardQuestionDark: {
        backgroundColor: '#450a0a',
        borderColor: '#7f1d1d',
    },
});
