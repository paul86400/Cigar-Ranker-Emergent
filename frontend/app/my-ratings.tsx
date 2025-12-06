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

interface UserRating {
  id: string;
  rating: number;
  created_at: string;
  cigar_id: string;
  cigar_name: string;
  cigar_brand: string;
  cigar_image: string;
  cigar_strength: string;
  cigar_origin: string;
  average_rating: number;
}

export default function MyRatingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [ratings, setRatings] = useState<UserRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMyRatings();
  }, []);

  const loadMyRatings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/ratings/my-ratings');
      setRatings(response.data);
    } catch (error: any) {
      console.error('Error loading ratings:', error);
      setError('Failed to load your ratings. Please try again.');
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

  const renderRatingCard = (rating: UserRating) => (
    <TouchableOpacity
      key={rating.id}
      style={styles.ratingCard}
      onPress={() => router.push(`/cigar/${rating.cigar_id}`)}
    >
      <View style={styles.cigarImageContainer}>
        <Image
          source={{ uri: `data:image/jpeg;base64,${rating.cigar_image}` }}
          style={styles.cigarImage}
          resizeMode="contain"
        />
      </View>
      
      <View style={styles.ratingInfo}>
        <Text style={styles.cigarBrand}>{rating.cigar_brand}</Text>
        <Text style={styles.cigarName}>{rating.cigar_name}</Text>
        
        <View style={styles.detailsRow}>
          <Text style={styles.cigarDetails}>
            {rating.cigar_strength} • {rating.cigar_origin}
          </Text>
        </View>

        <View style={styles.ratingRow}>
          <View style={styles.yourRating}>
            <Text style={styles.yourRatingLabel}>Your Rating:</Text>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingValue}>{rating.rating.toFixed(1)}</Text>
            </View>
          </View>
          
          <Text style={styles.ratingDate}>{formatDate(rating.created_at)}</Text>
        </View>

        {rating.average_rating && (
          <Text style={styles.avgRating}>
            Community Avg: {rating.average_rating.toFixed(1)} ★
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/profile')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Ratings</Text>
        <View style={styles.placeholder} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B4513" />
          <Text style={styles.loadingText}>Loading your ratings...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadMyRatings}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : ratings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="star-outline" size={64} color="#888" />
          <Text style={styles.emptyTitle}>No Ratings Yet</Text>
          <Text style={styles.emptySubtext}>
            Start rating cigars to see them here!
          </Text>
          <TouchableOpacity 
            style={styles.browseButton}
            onPress={() => router.push('/(tabs)')}
          >
            <Text style={styles.browseButtonText}>Browse Cigars</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.ratingsList} contentContainerStyle={styles.ratingsListContent}>
          <View style={styles.statsContainer}>
            <View style={styles.statBoxSingle}>
              <Text style={styles.statValue}>{ratings.length}</Text>
              <Text style={styles.statLabel}>Total Ratings</Text>
            </View>
          </View>

          {ratings.map(renderRatingCard)}
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
  ratingsList: {
    flex: 1,
  },
  ratingsListContent: {
    padding: 16,
    paddingBottom: 32,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
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
  ratingCard: {
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
  ratingInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  cigarBrand: {
    fontSize: 12,
    color: '#888',
  },
  cigarName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 2,
  },
  detailsRow: {
    marginTop: 4,
  },
  cigarDetails: {
    fontSize: 12,
    color: '#666',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  yourRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  yourRatingLabel: {
    fontSize: 12,
    color: '#888',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  ratingValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  ratingDate: {
    fontSize: 12,
    color: '#666',
  },
  avgRating: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
});
