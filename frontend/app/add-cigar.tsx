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
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customCigar, setCustomCigar] = useState({
    brand: '',
    name: '',
    strength: 'medium',
    origin: '',
    wrapper: '',
    size: '',
    price_range: '',
  });

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
          // Cigar already exists - show in UI
          setExistingCigar(response.data.existing_cigar);
          setCigarInfo(null);
        } else {
          // New cigar - show details for review
          setCigarInfo(response.data.cigar_info);
          setExistingCigar(null);
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
    if (!cigarInfo) {
      console.log('No cigar info available');
      return;
    }

    // Validate at least brand and name are present
    if (!cigarInfo.brand || !cigarInfo.name) {
      Alert.alert(
        'Missing Information',
        'Brand and name are required. Please try searching again.'
      );
      return;
    }

    try {
      setSubmitting(true);
      console.log('Submitting cigar:', cigarInfo);
      
      const formData = new FormData();
      formData.append('brand', (cigarInfo.brand || '').trim());
      formData.append('name', (cigarInfo.name || '').trim());
      formData.append('strength', (cigarInfo.strength || 'medium').toLowerCase().trim());
      formData.append('origin', (cigarInfo.origin || 'Unknown').trim());
      formData.append('wrapper', (cigarInfo.wrapper || 'Unknown').trim());
      formData.append('size', (cigarInfo.size || 'Standard').trim());
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
      console.log('Cigar ID:', response.data.cigar_id);

      // Always navigate to the cigar page (whether new or existing)
      if (response.data.cigar_id) {
        console.log('Navigating to cigar:', response.data.cigar_id);
        router.replace(`/cigar/${response.data.cigar_id}`);
      } else {
        console.error('No cigar_id in response');
        Alert.alert('Error', 'Cigar was added but could not navigate to it.');
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
    setShowCustomForm(false);
  };

  const handleCustomAdd = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to add cigars');
      return;
    }

    if (!customCigar.brand.trim() || !customCigar.name.trim()) {
      Alert.alert('Missing Information', 'Brand and name are required');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('brand', customCigar.brand.trim());
      formData.append('name', customCigar.name.trim());
      formData.append('strength', customCigar.strength.toLowerCase().trim());
      formData.append('origin', customCigar.origin.trim() || 'Unknown');
      formData.append('wrapper', customCigar.wrapper.trim() || 'Unknown');
      formData.append('size', customCigar.size.trim() || 'Standard');
      if (customCigar.price_range) {
        formData.append('price_range', customCigar.price_range);
      }

      const response = await api.post('/cigars/add', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.cigar_id) {
        router.replace(`/cigar/${response.data.cigar_id}`);
      } else {
        Alert.alert('Error', 'Cigar was added but could not navigate to it.');
      }
    } catch (error: any) {
      console.error('Error adding cigar:', error);
      Alert.alert('Error', error.response?.data?.detail || 'Failed to add cigar');
    } finally {
      setSubmitting(false);
    }
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

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.customSearchButton}
              onPress={() => setShowCustomForm(true)}
            >
              <Ionicons name="create-outline" size={24} color="#8B4513" />
              <Text style={styles.customSearchButtonText}>Custom Search</Text>
            </TouchableOpacity>
          </View>
        )}

        {showCustomForm && (
          <View style={styles.customFormSection}>
            <View style={styles.resultHeader}>
              <Ionicons name="create" size={32} color="#8B4513" />
              <Text style={[styles.resultTitle, { color: '#8B4513' }]}>Custom Entry</Text>
            </View>

            <Text style={styles.resultDescription}>
              Manually enter cigar details below
            </Text>

            <View style={styles.formContainer}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Brand *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g., Padron"
                  placeholderTextColor="#888"
                  value={customCigar.brand}
                  onChangeText={(text) => setCustomCigar({...customCigar, brand: text})}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Name *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g., 1964 Anniversary"
                  placeholderTextColor="#888"
                  value={customCigar.name}
                  onChangeText={(text) => setCustomCigar({...customCigar, name: text})}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Strength</Text>
                <View style={styles.strengthButtons}>
                  {['Mild', 'Medium', 'Full'].map((strength) => (
                    <TouchableOpacity
                      key={strength}
                      style={[
                        styles.strengthButton,
                        customCigar.strength.toLowerCase() === strength.toLowerCase() && styles.strengthButtonActive
                      ]}
                      onPress={() => setCustomCigar({...customCigar, strength: strength.toLowerCase()})}
                    >
                      <Text style={[
                        styles.strengthButtonText,
                        customCigar.strength.toLowerCase() === strength.toLowerCase() && styles.strengthButtonTextActive
                      ]}>
                        {strength}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Origin</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g., Nicaragua"
                  placeholderTextColor="#888"
                  value={customCigar.origin}
                  onChangeText={(text) => setCustomCigar({...customCigar, origin: text})}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Wrapper</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g., Maduro"
                  placeholderTextColor="#888"
                  value={customCigar.wrapper}
                  onChangeText={(text) => setCustomCigar({...customCigar, wrapper: text})}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Size</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g., Robusto"
                  placeholderTextColor="#888"
                  value={customCigar.size}
                  onChangeText={(text) => setCustomCigar({...customCigar, size: text})}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Price Range</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g., 15-20"
                  placeholderTextColor="#888"
                  value={customCigar.price_range}
                  onChangeText={(text) => setCustomCigar({...customCigar, price_range: text})}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.addButton, submitting && styles.addButtonDisabled]}
              onPress={handleCustomAdd}
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
              <Text style={styles.searchAnotherText}>Back to Search</Text>
            </TouchableOpacity>
          </View>
        )}

        {existingCigar && (
          <View style={styles.resultsSection}>
            <View style={styles.resultHeader}>
              <Ionicons name="information-circle" size={32} color="#FFA500" />
              <Text style={[styles.resultTitle, { color: '#FFA500' }]}>Already in Database!</Text>
            </View>
            
            <Text style={styles.resultDescription}>
              This cigar already exists in our database. You can view it below.
            </Text>

            <View style={styles.detailsCard}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Brand:</Text>
                <Text style={styles.detailValue}>{existingCigar.brand}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Name:</Text>
                <Text style={styles.detailValue}>{existingCigar.name}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Rating:</Text>
                <Text style={styles.detailValue}>⭐ {existingCigar.average_rating.toFixed(1)} ({existingCigar.rating_count} ratings)</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.viewButton}
              onPress={() => router.replace(`/cigar/${existingCigar.id}`)}
            >
              <Ionicons name="eye" size={24} color="#fff" />
              <Text style={styles.viewButtonText}>View Cigar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.searchAnotherButton}
              onPress={handleSearchAnother}
            >
              <Text style={styles.searchAnotherText}>Search Another Cigar</Text>
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
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B4513',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 12,
  },
  viewButtonText: {
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#333',
  },
  dividerText: {
    color: '#888',
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: '600',
  },
  customSearchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    borderWidth: 2,
    borderColor: '#8B4513',
  },
  customSearchButtonText: {
    color: '#8B4513',
    fontSize: 18,
    fontWeight: 'bold',
  },
  customFormSection: {
    marginTop: 8,
  },
  formContainer: {
    gap: 16,
    marginBottom: 24,
  },
  formGroup: {
    gap: 8,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  formInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
    outlineStyle: 'none',
  },
  strengthButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  strengthButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  strengthButtonActive: {
    backgroundColor: '#8B4513',
    borderColor: '#8B4513',
  },
  strengthButtonText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
  },
  strengthButtonTextActive: {
    color: '#fff',
  },
});
