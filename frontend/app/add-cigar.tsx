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
  
  const [brand, setBrand] = useState('');
  const [name, setName] = useState('');
  const [strength, setStrength] = useState('');
  const [origin, setOrigin] = useState('');
  const [wrapper, setWrapper] = useState('');
  const [size, setSize] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const strengthOptions = ['Mild', 'Mild-Medium', 'Medium', 'Medium-Full', 'Full'];

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to add cigars');
      return;
    }

    if (!brand || !name || !strength || !origin || !wrapper || !size) {
      Alert.alert('Missing Fields', 'Please fill in all required fields');
      return;
    }

    try {
      setSubmitting(true);
      
      const formData = new FormData();
      formData.append('brand', brand);
      formData.append('name', name);
      formData.append('strength', strength.toLowerCase());
      formData.append('origin', origin);
      formData.append('wrapper', wrapper);
      formData.append('size', size);
      if (priceRange) {
        formData.append('price_range', priceRange);
      }

      const response = await api.post('/cigars/add', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        Alert.alert(
          'Success!',
          'Your cigar has been added to the database.',
          [
            {
              text: 'View Cigar',
              onPress: () => router.replace(`/cigar/${response.data.cigar_id}`)
            }
          ]
        );
      } else {
        Alert.alert('Already Exists', response.data.message);
        if (response.data.cigar_id) {
          router.replace(`/cigar/${response.data.cigar_id}`);
        }
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
          Can't find your cigar? Add it to our database and help the community!
        </Text>

        <View style={styles.section}>
          <Text style={styles.label}>Brand *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Padron, Montecristo"
            placeholderTextColor="#888"
            value={brand}
            onChangeText={setBrand}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 1964 Anniversary Maduro"
            placeholderTextColor="#888"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Strength *</Text>
          <View style={styles.optionsRow}>
            {strengthOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionButton,
                  strength === option && styles.optionButtonActive
                ]}
                onPress={() => setStrength(option)}
              >
                <Text style={[
                  styles.optionText,
                  strength === option && styles.optionTextActive
                ]}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Origin *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Nicaragua, Dominican Republic"
            placeholderTextColor="#888"
            value={origin}
            onChangeText={setOrigin}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Wrapper *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Habano, Maduro, Connecticut"
            placeholderTextColor="#888"
            value={wrapper}
            onChangeText={setWrapper}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Size *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Toro (6 x 52), Robusto (5 x 50)"
            placeholderTextColor="#888"
            value={size}
            onChangeText={setSize}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Price Range (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 10-15"
            placeholderTextColor="#888"
            value={priceRange}
            onChangeText={setPriceRange}
            keyboardType="numeric"
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="add-circle-outline" size={24} color="#fff" />
              <Text style={styles.submitButtonText}>Add Cigar</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.note}>
          * Required fields. After adding, you can upload an image for this cigar.
        </Text>
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
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    outlineStyle: 'none',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
  },
  optionButtonActive: {
    backgroundColor: '#8B4513',
    borderColor: '#8B4513',
  },
  optionText: {
    fontSize: 14,
    color: '#888',
  },
  optionTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B4513',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  note: {
    fontSize: 12,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
    lineHeight: 18,
  },
});
