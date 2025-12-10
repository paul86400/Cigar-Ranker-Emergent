import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

export default function AddCigarScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [cigarInfo, setCigarInfo] = useState<any>(null);
  const [existingCigar, setExistingCigar] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSearch = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to add cigars');
      return;
    }

    if (!searchQuery.trim()) {
      Alert.alert('Empty Search', 'Please enter a cigar name to search');
      return;
    }

    try {
      setSearching(true);
      setCigarInfo(null);
      setExistingCigar(null);
      
      const response = await api.post('/cigars/ai-search', {
        query: searchQuery
      });

      if (response.data.found) {
        if (response.data.exists_in_db) {
          // Cigar already exists
          setExistingCigar(response.data.existing_cigar);
          Alert.alert(
            'Cigar Found!',
            'This cigar already exists in our database.',
            [
              {
                text: 'View Cigar',
                onPress: () => router.replace(`/cigar/${response.data.existing_cigar.id}`)
              },
              {
                text: 'Search Again',
                style: 'cancel'
              }
            ]
          );
        } else {
          // New cigar - show details for review
          setCigarInfo(response.data.cigar_info);
        }
      } else {
        Alert.alert('Not Found', response.data.message || 'Could not find cigar details');
      }
    } catch (error: any) {
      console.error('Error searching cigar:', error);
      Alert.alert('Error', error.response?.data?.detail || 'Failed to search for cigar');
    } finally {
      setSearching(false);
    }
  };

  const handleAddCigar = async () => {
    if (!cigarInfo) return;

    // Validate required fields
    const requiredFields = ['brand', 'name', 'strength', 'origin', 'wrapper', 'size'];
    const missingFields = requiredFields.filter(field => !cigarInfo[field] || cigarInfo[field].trim() === '');
    
    if (missingFields.length > 0) {
      Alert.alert(
        'Missing Information',
        `The AI couldn't find all details. Missing: ${missingFields.join(', ')}. Please try searching again with more specific information.`
      );
      return;
    }

    try {
      setSubmitting(true);
      console.log('Submitting cigar:', cigarInfo);
      
      const formData = new FormData();
      formData.append('brand', cigarInfo.brand.trim());
      formData.append('name', cigarInfo.name.trim());
      formData.append('strength', cigarInfo.strength.toLowerCase().trim());
      formData.append('origin', cigarInfo.origin.trim());
      formData.append('wrapper', cigarInfo.wrapper.trim());
      formData.append('size', cigarInfo.size.trim());
      if (cigarInfo.price_range) {
        formData.append('price_range', cigarInfo.price_range);
      }

      console.log('Calling API to add cigar...');
      const response = await api.post('/cigars/add', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('API response:', response.data);

      if (response.data.success) {
        Alert.alert(
          'Success!',
          'Cigar has been added to the database.',
          [
            {
              text: 'View Cigar',
              onPress: () => router.replace(`/cigar/${response.data.cigar_id}`)
            }
          ]
        );
      } else {
        Alert.alert(
          'Already Exists',
          response.data.message,
          [
            {
              text: 'View Existing',
              onPress: () => router.replace(`/cigar/${response.data.cigar_id}`)
            },
            {
              text: 'OK',
              style: 'cancel'
            }
          ]
        );
      }
    } catch (error: any) {
      console.error('Error adding cigar:', error);
      console.error('Error response:', error.response?.data);
      Alert.alert('Error', error.response?.data?.detail || error.message || 'Failed to add cigar. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSearchAnother = () => {
    setSearchQuery('');
    setCigarInfo(null);
    setExistingCigar(null);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Cigar</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.description}>
          Search for a cigar and our AI will find the details for you!
        </Text>

        {!cigarInfo && !existingCigar && (
          <View style={styles.searchSection}>
            <Text style={styles.label}>Search for Cigar</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="e.g., Padron 50th Anniversary"
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              autoFocus
            />
            <TouchableOpacity
              style={[styles.searchButton, searching && styles.searchButtonDisabled]}
              onPress={handleSearch}
              disabled={searching}
            >
              {searching ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="search" size={24} color="#fff" />
                  <Text style={styles.searchButtonText}>Search</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {cigarInfo && (
          <View style={styles.resultsSection}>
            <View style={styles.resultHeader}>
              <Ionicons name="checkmark-circle" size={32} color="#4CAF50" />
              <Text style={styles.resultTitle}>Cigar Found!</Text>
            </View>
            
            <Text style={styles.resultDescription}>
              Review the details below. Tap "Add Cigar" if everything looks correct.
            </Text>

            <View style={styles.detailsCard}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Brand:</Text>
                <Text style={styles.detailValue}>{cigarInfo.brand || 'N/A'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Name:</Text>
                <Text style={styles.detailValue}>{cigarInfo.name || 'N/A'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Strength:</Text>
                <Text style={styles.detailValue}>{cigarInfo.strength || 'N/A'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Origin:</Text>
                <Text style={styles.detailValue}>{cigarInfo.origin || 'N/A'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Wrapper:</Text>
                <Text style={styles.detailValue}>{cigarInfo.wrapper || 'N/A'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Size:</Text>
                <Text style={styles.detailValue}>{cigarInfo.size || 'N/A'}</Text>
              </View>
              {cigarInfo.price_range && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Price Range:</Text>
                  <Text style={styles.detailValue}>${cigarInfo.price_range}</Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={[styles.addButton, submitting && styles.addButtonDisabled]}
              onPress={handleAddCigar}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="add-circle" size={24} color="#fff" />
                  <Text style={styles.addButtonText}>Add Cigar</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.searchAnotherButton}
              onPress={handleSearchAnother}
            >
              <Text style={styles.searchAnotherText}>Search Another Cigar</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  description: {
    fontSize: 14,
    color: '#888',
    marginBottom: 24,
    lineHeight: 20,
    textAlign: 'center',
  },
  searchSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    marginBottom: 16,
    outlineStyle: 'none',
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B4513',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  searchButtonDisabled: {
    opacity: 0.5,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resultsSection: {
    marginTop: 8,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  resultDescription: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  detailsCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  detailLabel: {
    fontSize: 14,
    color: '#888',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 12,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchAnotherButton: {
    padding: 16,
    alignItems: 'center',
  },
  searchAnotherText: {
    color: '#8B4513',
    fontSize: 16,
    fontWeight: '600',
  },
});
