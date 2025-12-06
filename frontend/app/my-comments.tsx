import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

interface UserComment {
  id: string;
  text: string;
  created_at: string;
  cigar_id: string;
  cigar_name: string;
  cigar_brand: string;
  cigar_image: string;
}

export default function MyCommentsScreen() {
  console.log('=== MyCommentsScreen RENDERED ===');
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  console.log('=== User:', user ? user.username : 'NOT LOGGED IN');
  const [comments, setComments] = useState<UserComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('=== useEffect triggered, calling loadMyComments ===');
    loadMyComments();
  }, []);

  const loadMyComments = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching my comments...');
      const response = await api.get('/comments/my-comments');
      console.log('My comments response:', response.data);
      console.log('Number of comments:', response.data?.length || 0);
      setComments(response.data);
    } catch (error: any) {
      console.error('Error loading comments:', error);
      console.error('Error response:', error.response?.data);
      setError('Failed to load your comments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const renderCommentCard = (comment: UserComment) => (
    <TouchableOpacity
      key={comment.id}
      style={styles.commentCard}
      onPress={() => router.push(`/cigar/${comment.cigar_id}`)}
    >
      <View style={styles.cigarImageContainer}>
        <Image
          source={{ uri: `data:image/jpeg;base64,${comment.cigar_image}` }}
          style={styles.cigarImage}
          resizeMode="contain"
        />
      </View>
      
      <View style={styles.commentInfo}>
        <Text style={styles.cigarBrand}>{comment.cigar_brand}</Text>
        <Text style={styles.cigarName} numberOfLines={1}>{comment.cigar_name}</Text>
        
        <View style={styles.commentTextContainer}>
          <Text style={styles.commentText} numberOfLines={3}>
            {comment.text}
          </Text>
        </View>

        <View style={styles.commentFooter}>
          <View style={styles.dateContainer}>
            <Ionicons name="time-outline" size={14} color="#888" />
            <Text style={styles.commentDate}>{formatDate(comment.created_at)}</Text>
          </View>
          <View style={styles.viewButton}>
            <Text style={styles.viewButtonText}>View Cigar</Text>
            <Ionicons name="chevron-forward" size={16} color="#8B4513" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/profile')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Comments</Text>
        <View style={styles.placeholder} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B4513" />
          <Text style={styles.loadingText}>Loading your comments...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadMyComments}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : comments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubbles-outline" size={64} color="#888" />
          <Text style={styles.emptyTitle}>No Comments Yet</Text>
          <Text style={styles.emptySubtext}>
            Start commenting on cigars to see them here!
          </Text>
          <TouchableOpacity 
            style={styles.browseButton}
            onPress={() => router.push('/(tabs)')}
          >
            <Text style={styles.browseButtonText}>Browse Cigars</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.commentsList} contentContainerStyle={styles.commentsListContent}>
          <View style={styles.statsContainer}>
            <View style={styles.statBoxSingle}>
              <Text style={styles.statValue}>{comments.length}</Text>
              <Text style={styles.statLabel}>Total Comments</Text>
            </View>
          </View>

          {comments.map(renderCommentCard)}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0c0c',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  placeholder: {
    width: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#888',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 16,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#8B4513',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  browseButton: {
    backgroundColor: '#8B4513',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  commentsList: {
    flex: 1,
  },
  commentsListContent: {
    padding: 16,
    paddingBottom: 32,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  statBoxSingle: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 200,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#8B4513',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#888',
  },
  commentCard: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  cigarImageContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  cigarImage: {
    width: '100%',
    height: '100%',
  },
  commentInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  cigarBrand: {
    fontSize: 12,
    color: '#888',
  },
  cigarName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 2,
  },
  commentTextContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  commentText: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
  commentFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  commentDate: {
    fontSize: 12,
    color: '#888',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewButtonText: {
    fontSize: 12,
    color: '#8B4513',
    fontWeight: '600',
  },
});
