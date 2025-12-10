import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, refreshUser } = useAuth();
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const handleUploadPhoto = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need camera roll permissions to upload photos');
        return;
      }

      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setUploadingPhoto(true);
        
        const imageAsset = result.assets[0];
        
        if (!imageAsset.base64) {
          Alert.alert('Error', 'Could not read image data');
          return;
        }

        // Update profile with base64 image
        const response = await api.put('/auth/profile', {
          profile_pic: imageAsset.base64
        });

        if (response.data) {
          // Refresh user data to show new profile picture
          await refreshUser();
          Alert.alert('Success', 'Profile picture updated successfully!');
        }
      }
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      Alert.alert('Error', error.response?.data?.detail || 'Failed to upload photo. Please try again.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="person-circle-outline" size={64} color="#444" />
          <Text style={styles.emptyTitle}>Sign in to view profile</Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/auth/login')}
          >
            <Text style={styles.loginButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleLogout = async () => {
    await logout();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <View style={styles.profileImageContainer}>
            {user.profile_pic ? (
              <Image
                source={{ uri: `data:image/png;base64,${user.profile_pic}` }}
                style={styles.profileImage}
              />
            ) : (
              <Ionicons name="person" size={48} color="#888" />
            )}
          </View>
          <Text style={styles.username}>{user.username}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>

          <TouchableOpacity 
            style={[styles.menuItem, styles.addCigarMenuItem]}
            onPress={() => router.push('/add-cigar')}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="add-circle" size={24} color="#4CAF50" />
              <Text style={[styles.menuItemText, styles.addCigarText]}>Add a Cigar</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#4CAF50" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="settings-outline" size={24} color="#fff" />
              <Text style={styles.menuItemText}>Preferences</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#888" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="notifications-outline" size={24} color="#fff" />
              <Text style={styles.menuItemText}>Notifications</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#888" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/my-ratings')}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="star-outline" size={24} color="#fff" />
              <Text style={styles.menuItemText}>My Ratings</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#888" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/my-comments')}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="chatbubble-outline" size={24} color="#fff" />
              <Text style={styles.menuItemText}>My Comments</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#888" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
            <Text style={styles.logoutButtonText}>Sign Out</Text>
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
  content: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
  },
  loginButton: {
    backgroundColor: '#8B4513',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 24,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  profileImageContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#888',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: '#fff',
  },
  addCigarMenuItem: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  addCigarText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  logoutButtonText: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: 'bold',
  },
});
