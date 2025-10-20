import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [cigars, setCigars] = useState<Cigar[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCigars();
  }, []);

  const loadCigars = async () => {
    try {
      const response = await api.get('/cigars/search');
      setCigars(response.data);
    } catch (error) {
      console.error('Error loading cigars:', error);
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
      const response = await api.get(`/cigars/search?q=${searchQuery}`);
      setCigars(response.data);
    } catch (error) {
      console.error('Error searching:', error);
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
          source={{ uri: `data:image/png;base64,${cigar.image}` }}
          style={styles.cigarImage}
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cigar Ranker</Text>
        <TouchableOpacity onPress={() => router.push('/search')}>
          <Ionicons name="filter" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#888" />
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
          style={styles.cameraButton}
          onPress={() => router.push('/camera')}
        >
          <Ionicons name="camera" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B4513" />
        </View>
      ) : (
        <ScrollView style={styles.cigarList}>
          <Text style={styles.sectionTitle}>Popular Cigars</Text>
          {cigars.map(renderCigarCard)}
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
    padding: 16,
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
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    color: '#fff',
    fontSize: 16,
  },
  cameraButton: {
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
  },
  cigarList: {
    flex: 1,
    padding: 16,
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
  },
  cigarImage: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
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
});
