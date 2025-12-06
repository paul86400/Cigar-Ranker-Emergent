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
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
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
  const insets = useSafeAreaInsets();
  const [cigar, setCigar] = useState<Cigar | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState<number>(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

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
      setSubmittingRating(true);
      console.log('Submitting rating:', rating, 'for cigar:', id);
      
      await api.post('/ratings', {
        cigar_id: id,
        rating: rating,
      });
      
      setUserRating(rating);
      setRatingSubmitted(true);
      console.log('✅ Rating submitted successfully!');
      
      // Reload cigar to get updated average
      await loadCigarDetails();
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setRatingSubmitted(false);
      }, 3000);
      
    } catch (error) {
      console.error('❌ Error submitting rating:', error);
      Alert.alert('Error', 'Failed to submit rating. Please try again.');
    } finally {
      setSubmittingRating(false);
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

  const handleUploadImage = async () => {
    console.log('Upload image button clicked');
    
    if (!user) {
      Alert.alert('Login Required', 'Please login to upload images');
      return;
    }

    try {
      console.log('Requesting media library permissions...');
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('Permission status:', status);
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need camera roll permissions to upload images');
        return;
      }

      console.log('Launching image picker...');
      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      console.log('Image picker result:', result);

      if (!result.canceled && result.assets && result.assets[0]) {
        setUploadingImage(true);
        console.log('Image selected, preparing upload...');
        
        const imageAsset = result.assets[0];
        
        // For web, we need to handle it differently
        if (Platform.OS === 'web') {
          // Use base64 for web
          if (imageAsset.base64) {
            console.log('Uploading via base64 for web...');
            const response = await api.post(`/cigars/${id}/upload-image-base64`, {
              image_base64: imageAsset.base64,
            });

            if (response.data.success) {
              setCigar(prev => prev ? { ...prev, image: response.data.image } : null);
              Alert.alert('Success', 'Image updated successfully!');
            } else {
              Alert.alert('Error', response.data.message || 'Failed to upload image');
            }
          } else {
            Alert.alert('Error', 'Could not read image data');
          }
        } else {
          // Mobile: Use FormData
          const imageUri = imageAsset.uri;
          const formData = new FormData();
          const filename = imageUri.split('/').pop() || 'image.jpg';
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : 'image/jpeg';

          formData.append('file', {
            uri: imageUri,
            name: filename,
            type: type,
          } as any);

          console.log('Uploading via FormData for mobile...');
          const response = await api.post(`/cigars/${id}/upload-image`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          if (response.data.success) {
            setCigar(prev => prev ? { ...prev, image: response.data.image } : null);
            Alert.alert('Success', 'Image updated successfully!');
          } else {
            Alert.alert('Error', response.data.message || 'Failed to upload image');
          }
        }
      } else {
        console.log('Image picker was cancelled or no image selected');
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      console.error('Error details:', error.response?.data);
      Alert.alert('Error', error.response?.data?.detail || error.message || 'Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
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
      <View style={[styles.header, { paddingTop: insets.top }]}>
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
            source={{ uri: `data:image/jpeg;base64,${cigar.image}` }}
            style={styles.image}
            resizeMode="contain"
          />
          <TouchableOpacity 
            style={styles.uploadButton}
            onPress={handleUploadImage}
            disabled={uploadingImage}
          >
            {uploadingImage ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="camera" size={20} color="#fff" />
                <Text style={styles.uploadButtonText}>Change Photo</Text>
              </>
            )}
          </TouchableOpacity>
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
            {cigar.flavor_notes && cigar.flavor_notes.length > 0 ? (
              cigar.flavor_notes.map((note, index) => (
                <View key={index} style={styles.flavorNote}>
                  <Text style={styles.flavorNoteText}>{note}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noDataText}>No flavor notes available</Text>
            )}
          </View>
        </View>

        <View style={styles.rateSection}>
          <Text style={styles.sectionTitle}>Rate this cigar</Text>
          
          {ratingSubmitted && (
            <View style={styles.successBanner}>
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              <Text style={styles.successBannerText}>Rating submitted successfully!</Text>
            </View>
          )}
          
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
              style={[styles.submitRatingButton, submittingRating && styles.submitRatingButtonDisabled]}
              onPress={() => handleRating(userRating)}
              disabled={submittingRating}
            >
              {submittingRating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitRatingButtonText}>Submit Rating</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.actionButtons, { paddingBottom: insets.bottom }]}>
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
    height: 400,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  uploadButton: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(139, 69, 19, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
    alignSelf: 'center',
    maxWidth: 200,
    marginHorizontal: 'auto',
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
  submitRatingButtonDisabled: {
    backgroundColor: '#5a2d0a',
    opacity: 0.6,
  },
  submitRatingButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a3d1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#4CAF50',
    gap: 12,
  },
  successBannerText: {
    flex: 1,
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
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
  noDataText: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },
});
