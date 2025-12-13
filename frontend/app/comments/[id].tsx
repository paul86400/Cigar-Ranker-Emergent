import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

interface Comment {
  id: string;
  user_id: string;
  username: string;
  profile_pic?: string;
  text: string;
  created_at: string;
  replies: Comment[];
}

export default function CommentsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { id, highlight } = params;
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [highlightedComment, setHighlightedComment] = useState<string | null>(
    highlight ? String(highlight) : null
  );

  useEffect(() => {
    loadComments();
  }, [id]);

  const loadComments = async () => {
    try {
      const response = await api.get(`/comments/${id}`);
      setComments(response.data);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!user) {
      Alert.alert('Sign in required', 'Please sign in to comment');
      router.push('/auth/login');
      return;
    }

    if (!commentText.trim()) {
      Alert.alert('Error', 'Please enter a comment');
      return;
    }

    try {
      setSubmitting(true);
      await api.post('/comments', {
        cigar_id: id,
        text: commentText.trim(),
        parent_id: replyingTo,
      });

      setCommentText('');
      setReplyingTo(null);
      
      // Add small delay to ensure DB write completes before refreshing
      await new Promise(resolve => setTimeout(resolve, 500));
      await loadComments();
    } catch (error) {
      console.error('Error submitting comment:', error);
      Alert.alert('Error', 'Failed to submit comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment? This will also delete all replies.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/comments/${commentId}`);
              
              // Refresh comments after deletion
              await new Promise(resolve => setTimeout(resolve, 500));
              await loadComments();
            } catch (error: any) {
              console.error('Error deleting comment:', error);
              Alert.alert('Error', error.response?.data?.detail || 'Failed to delete comment');
            }
          }
        }
      ]
    );
  };

  const renderComment = (comment: Comment, depth: number = 0) => {
    const isHighlighted = highlightedComment === comment.id;
    
    return (
      <View 
        key={comment.id} 
        style={[
          styles.commentContainer, 
          { marginLeft: depth * 20 },
          isHighlighted && styles.highlightedComment
        ]}
      >
        <View style={styles.commentHeader}>
        <TouchableOpacity 
          style={styles.avatar}
          onPress={() => router.push(`/user/${comment.user_id}`)}
        >
          {comment.profile_pic ? (
            <Image
              source={{ uri: `data:image/png;base64,${comment.profile_pic}` }}
              style={styles.avatarImage}
            />
          ) : (
            <Ionicons name="person" size={16} color="#888" />
          )}
        </TouchableOpacity>
        <View style={styles.commentInfo}>
          <TouchableOpacity onPress={() => router.push(`/user/${comment.user_id}`)}>
            <Text style={styles.username}>{comment.username}</Text>
          </TouchableOpacity>
          <Text style={styles.timestamp}>
            {new Date(comment.created_at).toLocaleDateString()}
          </Text>
        </View>
      </View>
      <Text style={styles.commentText}>{comment.text}</Text>
      <View style={styles.commentActions}>
        <TouchableOpacity
          style={styles.replyButton}
          onPress={() => setReplyingTo(comment.id)}
        >
          <Ionicons name="arrow-undo" size={16} color="#8B4513" />
          <Text style={styles.replyButtonText}>Reply</Text>
        </TouchableOpacity>
        
        {user && comment.user_id === user.id && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteComment(comment.id)}
          >
            <Ionicons name="trash-outline" size={16} color="#FF3B30" />
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>

      {comment.replies && comment.replies.length > 0 && (
        <View style={styles.repliesContainer}>
          {comment.replies.map((reply) => renderComment(reply, depth + 1))}
        </View>
      )}
    </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity 
          onPress={() => router.push('/(tabs)')}
          style={styles.backButton}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Discussions</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8B4513" />
          </View>
        ) : comments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={64} color="#444" />
            <Text style={styles.emptyText}>No discussions yet</Text>
            <Text style={styles.emptySubtext}>Be the first to comment!</Text>
          </View>
        ) : (
          <ScrollView style={styles.commentsList}>
            {comments.map((comment) => renderComment(comment))}
          </ScrollView>
        )}

        {replyingTo && (
          <View style={styles.replyingToContainer}>
            <Text style={styles.replyingToText}>Replying to comment</Text>
            <TouchableOpacity onPress={() => setReplyingTo(null)}>
              <Ionicons name="close" size={20} color="#888" />
            </TouchableOpacity>
          </View>
        )}

        <View style={[styles.inputContainer, { paddingBottom: insets.bottom }]}>
          {!user ? (
            <TouchableOpacity 
              style={styles.signInPrompt}
              onPress={() => router.push('/auth/login')}
            >
              <Ionicons name="log-in-outline" size={20} color="#8B4513" />
              <Text style={styles.signInPromptText}>Sign in to comment</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TextInput
                style={styles.input}
                placeholder="Write a comment..."
                placeholderTextColor="#888"
                value={commentText}
                onChangeText={setCommentText}
                multiline
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!commentText.trim() || submitting) && styles.sendButtonDisabled,
                ]}
                onPress={handleSubmitComment}
                disabled={!commentText.trim() || submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="send" size={20} color="#fff" />
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0c0c',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    paddingVertical: 16,
    paddingLeft: 24,
    paddingRight: 16,
    marginLeft: -24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  keyboardView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
  },
  commentsList: {
    flex: 1,
    padding: 16,
  },
  commentContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  highlightedComment: {
    backgroundColor: '#2a2010',
    borderWidth: 2,
    borderColor: '#8B4513',
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  commentInfo: {
    flex: 1,
  },
  username: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
  },
  commentText: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  replyButtonText: {
    fontSize: 12,
    color: '#8B4513',
    fontWeight: '600',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deleteButtonText: {
    fontSize: 12,
    color: '#FF3B30',
    fontWeight: '600',
  },
  repliesContainer: {
    marginTop: 8,
  },
  replyingToContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
  },
  replyingToText: {
    color: '#8B4513',
    fontSize: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  input: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#8B4513',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#333',
  },
  signInPrompt: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 24,
    paddingVertical: 14,
    gap: 8,
  },
  signInPromptText: {
    color: '#8B4513',
    fontSize: 16,
    fontWeight: '600',
  },
});
