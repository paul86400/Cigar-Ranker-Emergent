import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

interface Cigar {
  id: string;
  name: string;
  brand: string;
  image: string;
  strength: string;
  origin: string;
  average_rating: number;
  price_range: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [cigars, setCigars] = useState<Cigar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if there are advanced search parameters
    if (params.q || params.strength || params.origin || params.wrapper || params.size || params.min_price || params.max_price) {
      performAdvancedSearch();
    } else {
      loadCigars();
    }
  }, [params]);

  const loadCigars = async () => {
    try {
      setError(null);
      setLoading(true);
      console.log('Loading cigars...');
      const response = await api.get('/cigars/search');
      console.log(`Loaded ${response.data.length} cigars`);
      setCigars(response.data);
    } catch (error: any) {
      console.error('Error loading cigars:', error);
      setError('Failed to load cigars. Please try again.');
      Alert.alert('Error', 'Failed to load cigars. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const performAdvancedSearch = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query string from URL parameters
      const queryParams = new URLSearchParams();
      if (params.q) queryParams.append('q', params.q as string);
      if (params.strength) queryParams.append('strength', params.strength as string);
      if (params.origin) queryParams.append('origin', params.origin as string);
      if (params.wrapper) queryParams.append('wrapper', params.wrapper as string);
      if (params.size) queryParams.append('size', params.size as string);
      if (params.min_price) queryParams.append('min_price', params.min_price as string);
      if (params.max_price) queryParams.append('max_price', params.max_price as string);
      
      const queryString = queryParams.toString();
      console.log('Performing advanced search:', queryString);
      
      const response = await api.get(`/cigars/search?${queryString}`);
      console.log(`Found ${response.data.length} cigars`);
      setCigars(response.data);
      
      // Update the search query display if there's a text search
      if (params.q) {
        setSearchQuery(params.q as string);
      }
    } catch (error) {
      console.error('Error searching:', error);
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadCigars();
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/cigars/search?q=${searchQuery}`);
      setCigars(response.data);
    } catch (error) {
      console.error('Error searching:', error);
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderCigarCard = (cigar: Cigar) => (
    <TouchableOpacity
      key={cigar.id}
      style={styles.cigarCard}
      onPress={() => router.push(`/cigar/${cigar.id}`)}
    >
      <View style={styles.cigarImageContainer}>
        <Image
          source={{ uri: `data:image/jpeg;base64,${cigar.image}` }}
          style={styles.cigarImage}
          resizeMode="contain"
        />
      </View>
      <View style={styles.cigarInfo}>
        <Text style={styles.cigarBrand}>{cigar.brand}</Text>
        <Text style={styles.cigarName}>{cigar.name}</Text>
        <View style={styles.cigarDetails}>
          <Text style={styles.cigarStrength}>{cigar.strength}</Text>
          <Text style={styles.cigarOrigin}>{cigar.origin}</Text>
        </View>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={styles.rating}>{cigar.average_rating.toFixed(1)}</Text>
          <Text style={styles.price}>${cigar.price_range}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cigar Ranker</Text>
        <TouchableOpacity 
          onPress={() => router.push('/search')}
          style={styles.cigarMenuButton}
        >
          <View style={styles.cigarLine} />
          <View style={styles.cigarLine} />
          <View style={styles.cigarLine} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TouchableOpacity
          style={styles.cameraButton}
          onPress={() => router.push('/camera')}
        >
          <Ionicons name="camera" size={24} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search cigars..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
        </View>
        
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch}
        >
          <Ionicons name="search" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B4513" />
          <Text style={styles.loadingText}>Loading cigars...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={48} color="#FF6B6B" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadCigars}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : cigars.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={48} color="#888" />
          <Text style={styles.emptyText}>No cigars found</Text>
          <Text style={styles.emptySubtext}>Try a different search term</Text>
        </View>
      ) : (
        <ScrollView style={styles.cigarList} contentContainerStyle={styles.cigarListContent}>
          <Text style={styles.sectionTitle}>Popular Cigars</Text>
          {cigars.map(renderCigarCard)}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  cameraButton: {
    width: 48,
    height: 48,
    backgroundColor: '#8B4513',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  searchInput: {
    flex: 1,
    height: 48,
    color: '#fff',
    fontSize: 16,
    outlineStyle: 'none',
  },
  searchButton: {
    width: 48,
    height: 48,
    backgroundColor: '#8B4513',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
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
    gap: 8,
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubtext: {
    color: '#888',
    fontSize: 14,
  },
  cigarList: {
    flex: 1,
  },
  cigarListContent: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  cigarCard: {
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
  cigarInfo: {
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
  },
  cigarDetails: {
    flexDirection: 'row',
    gap: 12,
  },
  cigarStrength: {
    fontSize: 12,
    color: '#8B4513',
  },
  cigarOrigin: {
    fontSize: 12,
    color: '#666',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 8,
  },
  price: {
    fontSize: 14,
    color: '#4CAF50',
  },
  cigarMenuButton: {
    width: 32,
    height: 32,
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  cigarLine: {
    width: 32,
    height: 6,
    backgroundColor: '#8B4513',
    borderRadius: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
});
