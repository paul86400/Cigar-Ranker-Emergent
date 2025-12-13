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
  Modal,
  KeyboardAvoidingView,
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
  const params = useLocalSearchParams();
  const { id } = params;
  const { user, refreshUser } = useAuth();
  const insets = useSafeAreaInsets();
  const [cigar, setCigar] = useState<Cigar | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState<number>(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [noteText, setNoteText] = useState<string>('');
  const [originalNoteText, setOriginalNoteText] = useState<string>('');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [loadingNote, setLoadingNote] = useState(false);

  useEffect(() => {
    loadCigarDetails();
    loadUserNote();
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

  const loadUserNote = async () => {
    if (!user) return;
    
    try {
      setLoadingNote(true);
      const response = await api.get(`/cigars/${id}/my-note`);
      if (response.data && response.data.note_text) {
        setNoteText(response.data.note_text);
        setOriginalNoteText(response.data.note_text);
      } else {
        setNoteText('');
        setOriginalNoteText('');
      }
    } catch (error) {
      console.error('Error loading note:', error);
      setNoteText('');
      setOriginalNoteText('');
    } finally {
      setLoadingNote(false);
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

  const handleOpenNoteModal = () => {
    if (!user) {
      Alert.alert('Sign in required', 'Please sign in to add notes');
      router.push('/auth/login');
      return;
    }
    // Store the original note text when opening modal
    setOriginalNoteText(noteText);
    setShowNoteModal(true);
  };

  const handleCloseModal = () => {
    // Restore original note text when canceling
    setNoteText(originalNoteText);
    setShowNoteModal(false);
  };

  const handleSaveNote = async () => {
    if (!user) {
      Alert.alert('Sign in required', 'Please sign in to add notes');
      return;
    }

    try {
      setSavingNote(true);
      await api.post(`/cigars/${id}/my-note`, {
        note_text: noteText
      });
      
      // Update the original note text to the saved version
      setOriginalNoteText(noteText);
      setShowNoteModal(false);
      Alert.alert('Success', 'Note saved successfully!');
    } catch (error: any) {
      console.error('Error saving note:', error);
      Alert.alert('Error', error.response?.data?.detail || 'Failed to save note');
    } finally {
      setSavingNote(false);
    }
  };

  const handleClearNote = () => {
    // Simply clear the text in the UI
    setNoteText('');
  };

  const handleUploadImage = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to upload images');
      return;
    }

    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need camera roll permissions to upload images');
        return;
      }

      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setUploadingImage(true);
        
        const imageAsset = result.assets[0];
        
        if (!imageAsset.base64) {
          Alert.alert('Error', 'Could not read image data');
          return;
        }

        // Use base64 upload (works for both web and mobile)
        const response = await api.post(`/cigars/${id}/upload-image-base64`, {
          image_base64: imageAsset.base64,
        });

        if (response.data.success) {
          setCigar(prev => prev ? { ...prev, image: response.data.image } : null);
          Alert.alert('Success', 'Image uploaded successfully!');
        } else {
          Alert.alert('Error', response.data.message || 'Failed to upload image');
        }
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to upload image';
      
      if (errorMessage.includes('inappropriate content')) {
        Alert.alert(
          'Content Rejected',
          'The image was rejected by our AI moderation system. Please ensure the image is appropriate and related to cigars.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', errorMessage);
      }
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
          onPress={() => {
            // Check if we have return params (from advanced search)
            const hasReturnParams = params.returnQ || params.returnStrength || params.returnOrigin || 
                                   params.returnWrapper || params.returnSize || params.returnMinPrice || params.returnMaxPrice;
            
            if (hasReturnParams) {
              // Restore the search parameters
              const searchParams = new URLSearchParams();
              if (params.returnQ) searchParams.append('q', params.returnQ as string);
              if (params.returnStrength) searchParams.append('strength', params.returnStrength as string);
              if (params.returnOrigin) searchParams.append('origin', params.returnOrigin as string);
              if (params.returnWrapper) searchParams.append('wrapper', params.returnWrapper as string);
              if (params.returnSize) searchParams.append('size', params.returnSize as string);
              if (params.returnMinPrice) searchParams.append('min_price', params.returnMinPrice as string);
              if (params.returnMaxPrice) searchParams.append('max_price', params.returnMaxPrice as string);
              
              router.push(`/(tabs)?${searchParams.toString()}`);
            } else {
              router.push('/(tabs)');
            }
          }}
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
          {cigar.image ? (
            <Image
              source={{ uri: `data:image/jpeg;base64,${cigar.image}` }}
              style={styles.image}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.placeholderContainer}>
              <Ionicons name="image-outline" size={64} color="#555" />
              <Text style={styles.placeholderText}>
                No cigar image yet.{'\n'}Feel free to upload your own.
              </Text>
            </View>
          )}
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
                <Text style={styles.uploadButtonText}>
                  {cigar.image ? 'Change Photo' : 'Upload Photo'}
                </Text>
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

          <TouchableOpacity
            style={styles.notesButton}
            onPress={handleOpenNoteModal}
          >
            <Ionicons 
              name={noteText ? "document-text" : "document-text-outline"} 
              size={20} 
              color="#fff" 
            />
            <Text style={styles.notesButtonText}>
              {noteText ? 'View/Edit Note' : 'Add Note'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Note Modal */}
      <Modal
        visible={showNoteModal}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>My Note</Text>
              <TouchableOpacity onPress={handleCloseModal}>
                <Ionicons name="close" size={28} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.noteInputContainer}>
              <TextInput
                style={styles.noteInput}
                value={noteText}
                onChangeText={setNoteText}
                placeholder="Write your personal notes about this cigar..."
                placeholderTextColor="#666"
                multiline
                maxLength={1000}
                textAlignVertical="top"
              />
              <Text style={styles.characterCount}>
                {noteText.length}/1000 characters
              </Text>
            </View>

            <View style={styles.modalActions}>
              {noteText.length > 0 && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={handleClearNote}
                >
                  <Text style={styles.clearButtonText}>Clear</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.saveButton, savingNote && styles.saveButtonDisabled]}
                onPress={handleSaveNote}
                disabled={savingNote}
              >
                {savingNote ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Note</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 32,
  },
  placeholderText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 24,
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
  notesButton: {
    flexDirection: 'row',
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#444',
  },
  notesButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  noteInputContainer: {
    marginBottom: 20,
  },
  noteInput: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    minHeight: 200,
    borderWidth: 1,
    borderColor: '#444',
  },
  characterCount: {
    color: '#888',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 8,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
  },
  clearButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#333',
    borderWidth: 1,
    borderColor: '#555',
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#8B4513',
    minWidth: 120,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#5a2d0a',
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
