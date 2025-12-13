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
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../../utils/api';

interface Cigar {
  id: string;
  brand: string;
  name: string;
  image?: string;
  average_rating: number;
  rating_count: number;
  user_rating?: number;
}

interface UserProfile {
  id: string;
  username: string;
  email?: string;
  profile_pic?: string;
  favorites?: string[];
  created_at: string;
  added_cigars: Cigar[];
  rated_cigars: Cigar[];
}

export default function UserProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, [id]);

  const loadUserProfile = async () => {
    try {
      const response = await api.get(`/users/${id}`);
      setProfile(response.data);
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
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

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>User Profile</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>User not found</Text>
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
        <Text style={styles.headerTitle}>User Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            {profile.profile_pic ? (
              <Image
                source={{ uri: `data:image/png;base64,${profile.profile_pic}` }}
                style={styles.profileImage}
              />
            ) : (
              <Ionicons name="person" size={64} color="#888" />
            )}
          </View>
          <Text style={styles.username}>{profile.username}</Text>
          <Text style={styles.joinDate}>
            Member since {new Date(profile.created_at).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Ionicons name="star" size={32} color="#8B4513" />
            <Text style={styles.statLabel}>Favorites</Text>
            <Text style={styles.statValue}>{profile.favorites?.length || 0}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="add-circle" size={32} color="#4CAF50" />
            <Text style={styles.statLabel}>Added</Text>
            <Text style={styles.statValue}>{profile.added_cigars?.length || 0}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="star-half" size={32} color="#FFD700" />
            <Text style={styles.statLabel}>Rated</Text>
            <Text style={styles.statValue}>{profile.rated_cigars?.length || 0}</Text>
          </View>
        </View>

        {profile.added_cigars && profile.added_cigars.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cigars Added</Text>
            {profile.added_cigars.map((cigar) => (
              <TouchableOpacity
                key={cigar.id}
                style={styles.cigarCard}
                onPress={() => router.push(`/cigar/${cigar.id}`)}
              >
                <View style={styles.cigarImageContainer}>
                  {cigar.image ? (
                    <Image
                      source={{ uri: `data:image/jpeg;base64,${cigar.image}` }}
                      style={styles.cigarImage}
                    />
                  ) : (
                    <View style={styles.cigarImagePlaceholder}>
                      <Ionicons name="image-outline" size={24} color="#555" />
                    </View>
                  )}
                </View>
                <View style={styles.cigarInfo}>
                  <Text style={styles.cigarBrand}>{cigar.brand}</Text>
                  <Text style={styles.cigarName}>{cigar.name}</Text>
                  <Text style={styles.cigarRating}>
                    ⭐ {cigar.average_rating.toFixed(1)} ({cigar.rating_count})
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#888" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {profile.rated_cigars && profile.rated_cigars.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cigars Rated</Text>
            {profile.rated_cigars.map((cigar) => (
              <TouchableOpacity
                key={cigar.id}
                style={styles.cigarCard}
                onPress={() => router.push(`/cigar/${cigar.id}`)}
              >
                <View style={styles.cigarImageContainer}>
                  {cigar.image ? (
                    <Image
                      source={{ uri: `data:image/jpeg;base64,${cigar.image}` }}
                      style={styles.cigarImage}
                    />
                  ) : (
                    <View style={styles.cigarImagePlaceholder}>
                      <Ionicons name="image-outline" size={24} color="#555" />
                    </View>
                  )}
                </View>
                <View style={styles.cigarInfo}>
                  <Text style={styles.cigarBrand}>{cigar.brand}</Text>
                  <Text style={styles.cigarName}>{cigar.name}</Text>
                  <View style={styles.ratingRow}>
                    <Text style={styles.cigarRating}>
                      ⭐ {cigar.average_rating.toFixed(1)} ({cigar.rating_count})
                    </Text>
                    <Text style={styles.userRating}>
                      Your rating: {cigar.user_rating?.toFixed(1) || 'N/A'}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#888" />
              </TouchableOpacity>
            ))}
          </View>
        )}
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
  profileSection: {
    alignItems: 'center',
    padding: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#8B4513',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  joinDate: {
    fontSize: 14,
    color: '#888',
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  statItem: {
    alignItems: 'center',
    gap: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#888',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  sectionTitle: {
    fontSize: 18,
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
    alignItems: 'center',
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
  cigarImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cigarInfo: {
    flex: 1,
  },
  cigarBrand: {
    fontSize: 14,
    color: '#888',
    marginBottom: 2,
  },
  cigarName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  cigarRating: {
    fontSize: 12,
    color: '#FFD700',
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  userRating: {
    fontSize: 12,
    color: '#8B4513',
    fontWeight: '600',
  },
});
