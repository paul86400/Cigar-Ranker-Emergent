import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

interface Cigar {
  id: string;
  name: string;
  brand: string;
  image: string;
  images: string[];
  strength: string;
  flavor_notes: string[];
  origin: string;
  wrapper: string;
  binder: string;
  filler: string;
  size: string;
  price_range: string;
  average_rating: number;
  rating_count: number;
}

export default function CigarDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user, refreshUser } = useAuth();
  const [cigar, setCigar] = useState<Cigar | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState<number>(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    loadCigarDetails();
  }, [id]);

  const loadCigarDetails = async () => {
    try {
      const response = await api.get(`/cigars/${id}`);
      setCigar(response.data);

      // Check if it's in favorites
      if (user) {
        setIsFavorite(user.favorites?.includes(id as string) || false);
        
        // Load user's rating
        try {
          const ratingResponse = await api.get(`/ratings/user/${id}`);
          if (ratingResponse.data) {
            setUserRating(ratingResponse.data.rating);
          }
        } catch (error) {
          // No rating yet
        }
      }
    } catch (error) {
      console.error('Error loading cigar:', error);
      Alert.alert('Error', 'Failed to load cigar details');
    } finally {
      setLoading(false);
    }
  };

  const handleRating = async (rating: number) => {
    if (!user) {
      Alert.alert('Sign in required', 'Please sign in to rate cigars');
      router.push('/auth/login');
      return;
    }

    try {
      await api.post('/ratings', {
        cigar_id: id,
        rating: rating,
      });
      setUserRating(rating);
      
      // Reload cigar to get updated average
      loadCigarDetails();
      Alert.alert('Success', 'Rating submitted!');
    } catch (error) {
      console.error('Error submitting rating:', error);
      Alert.alert('Error', 'Failed to submit rating');
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      Alert.alert('Sign in required', 'Please sign in to save favorites');
      router.push('/auth/login');
      return;
    }

    try {
      if (isFavorite) {
        await api.delete(`/favorites/${id}`);
        setIsFavorite(false);
      } else {
        await api.post(`/favorites/${id}`);
        setIsFavorite(true);
      }
      await refreshUser();
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Error', 'Failed to update favorites');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B4513" />
        </View>
      </SafeAreaView>
    );
  }

  if (!cigar) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Cigar not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.push('/(tabs)')}
          style={styles.backButton}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleFavorite}>
          <Ionicons 
            name={isFavorite ? "bookmark" : "bookmark-outline"} 
            size={24} 
            color={isFavorite ? "#8B4513" : "#fff"} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: `data:image/png;base64,${cigar.image}` }}
            style={styles.image}
          />
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.brand}>{cigar.brand}</Text>
          <Text style={styles.name}>{cigar.name}</Text>
          
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={24} color="#FFD700" />
            <Text style={styles.rating}>{cigar.average_rating.toFixed(1)}</Text>
            <Text style={styles.ratingCount}>({cigar.rating_count} ratings)</Text>
          </View>
        </View>

        <View style={styles.detailsSection}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Strength:</Text>
            <Text style={styles.detailValue}>{cigar.strength}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Origin:</Text>
            <Text style={styles.detailValue}>{cigar.origin}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Size:</Text>
            <Text style={styles.detailValue}>{cigar.size}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Wrapper:</Text>
            <Text style={styles.detailValue}>{cigar.wrapper}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Price Range:</Text>
            <Text style={styles.detailValue}>${cigar.price_range}</Text>
          </View>
        </View>

        <View style={styles.flavorSection}>
          <Text style={styles.sectionTitle}>Flavor Notes</Text>
          <View style={styles.flavorNotes}>
            {cigar.flavor_notes.map((note, index) => (
              <View key={index} style={styles.flavorNote}>
                <Text style={styles.flavorNoteText}>{note}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.rateSection}>
          <Text style={styles.sectionTitle}>Rate this cigar</Text>
          <View style={styles.sliderContainer}>
            <View style={styles.ratingDisplay}>
              <Text style={styles.ratingValue}>{userRating.toFixed(1)}</Text>
              <Ionicons name="star" size={32} color="#FFD700" />
            </View>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={10}
              step={0.1}
              value={userRating}
              onValueChange={(value) => setUserRating(value)}
              minimumTrackTintColor="#8B4513"
              maximumTrackTintColor="#333"
              thumbTintColor="#8B4513"
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>1.0</Text>
              <Text style={styles.sliderLabel}>5.5</Text>
              <Text style={styles.sliderLabel}>10.0</Text>
            </View>
            <TouchableOpacity
              style={styles.submitRatingButton}
              onPress={() => handleRating(userRating)}
            >
              <Text style={styles.submitRatingButtonText}>Submit Rating</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.buyButton}
            onPress={() => router.push(`/stores/${id}`)}
          >
            <Ionicons name="cart" size={20} color="#fff" />
            <Text style={styles.buyButtonText}>Where to Buy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.commentsButton}
            onPress={() => router.push(`/comments/${id}`)}
          >
            <Ionicons name="chatbubbles" size={20} color="#fff" />
            <Text style={styles.commentsButtonText}>Discussions</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  },
  backButton: {
    paddingVertical: 16,
    paddingLeft: 24,
    paddingRight: 16,
    marginLeft: -24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#888',
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    height: 250,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  infoSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  brand: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rating: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  ratingCount: {
    fontSize: 14,
    color: '#888',
  },
  detailsSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#888',
  },
  detailValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  flavorSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  flavorNotes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  flavorNote: {
    backgroundColor: '#8B4513',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  flavorNoteText: {
    color: '#fff',
    fontSize: 14,
  },
  rateSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  sliderContainer: {
    gap: 16,
  },
  ratingDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
  },
  ratingValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#888',
  },
  submitRatingButton: {
    backgroundColor: '#8B4513',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitRatingButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButtons: {
    padding: 20,
    gap: 12,
    marginBottom: 40,
  },
  buyButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  commentsButton: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  commentsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
