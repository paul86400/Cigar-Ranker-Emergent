import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  SafeAreaView,
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
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [comments, setComments] = useState<UserComment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyComments();
  }, []);

  const loadMyComments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/comments/my-all-comments');
      setComments(response.data);
    } catch (error: any) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Comments</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.centered}>
          <Ionicons name="chatbubble-outline" size={64} color="#888" />
          <Text style={styles.emptyText}>Please sign in to view your comments</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Comments</Text>
        <View style={styles.placeholder} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#8B4513" />
        </View>
      ) : comments.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="chatbubble-outline" size={64} color="#888" />
          <Text style={styles.emptyText}>You haven't made any comments yet</Text>
          <Text style={styles.emptySubtext}>
            Visit cigars and join the discussion!
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          <Text style={styles.count}>{comments.length} comment{comments.length !== 1 ? 's' : ''}</Text>
          {comments.map((comment) => (
            <TouchableOpacity
              key={comment.id}
              style={styles.commentCard}
              onPress={() => router.push(`/cigar/${comment.cigar_id}`)}
            >
              <View style={styles.cigarInfo}>
                <View style={styles.cigarImageContainer}>
                  {comment.cigar_image ? (
                    <Image
                      source={{ uri: `data:image/jpeg;base64,${comment.cigar_image}` }}
                      style={styles.cigarImage}
                    />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Ionicons name="image-outline" size={24} color="#555" />
                    </View>
                  )}
                </View>
                <View style={styles.cigarDetails}>
                  <Text style={styles.cigarBrand}>{comment.cigar_brand}</Text>
                  <Text style={styles.cigarName}>{comment.cigar_name}</Text>
                </View>
              </View>
              
              <View style={styles.commentContent}>
                <Text style={styles.commentText}>{comment.text}</Text>
                <Text style={styles.commentDate}>{formatDate(comment.created_at)}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  count: {
    fontSize: 14,
    color: '#888',
    padding: 16,
    paddingBottom: 8,
  },
  commentCard: {
    backgroundColor: '#1a1a1a',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
  },
  cigarInfo: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  cigarImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
  },
  cigarImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cigarDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  cigarBrand: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  cigarName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  commentContent: {
    gap: 8,
  },
  commentText: {
    fontSize: 14,
    color: '#fff',
    lineHeight: 20,
  },
  commentDate: {
    fontSize: 12,
    color: '#888',
  },
});
