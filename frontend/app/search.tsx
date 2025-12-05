import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AdvancedSearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [strength, setStrength] = useState('');
  const [origin, setOrigin] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [wrapper, setWrapper] = useState('');
  const [size, setSize] = useState('');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.append('q', searchQuery);
    if (strength) params.append('strength', strength);
    if (origin) params.append('origin', origin);
    if (minPrice) params.append('min_price', minPrice);
    if (maxPrice) params.append('max_price', maxPrice);
    if (wrapper) params.append('wrapper', wrapper);
    if (size) params.append('size', size);

    // Navigate back to home with search params
    router.back();
  };

  const strengthOptions = ['Mild', 'Medium', 'Medium-Full', 'Full'];
  const originOptions = ['Cuba', 'Nicaragua', 'Dominican Republic', 'Honduras'];
  const wrapperOptions = ['Habano', 'Maduro', 'Connecticut', 'Corojo'];
  const sizeOptions = ['Robusto', 'Toro', 'Churchill', 'Torpedo', 'Corona'];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.push('/(tabs)')}
          style={styles.closeButton}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Advanced Search</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.label}>Search</Text>
          <TextInput
            style={styles.input}
            placeholder="Cigar name or brand"
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Strength</Text>
          <View style={styles.optionsRow}>
            {strengthOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionButton,
                  strength === option && styles.optionButtonActive,
                ]}
                onPress={() => setStrength(strength === option ? '' : option)}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    strength === option && styles.optionButtonTextActive,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Origin</Text>
          <View style={styles.optionsRow}>
            {originOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionButton,
                  origin === option && styles.optionButtonActive,
                ]}
                onPress={() => setOrigin(origin === option ? '' : option)}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    origin === option && styles.optionButtonTextActive,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Wrapper</Text>
          <View style={styles.optionsRow}>
            {wrapperOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionButton,
                  wrapper === option && styles.optionButtonActive,
                ]}
                onPress={() => setWrapper(wrapper === option ? '' : option)}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    wrapper === option && styles.optionButtonTextActive,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Size</Text>
          <View style={styles.optionsRow}>
            {sizeOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionButton,
                  size === option && styles.optionButtonActive,
                ]}
                onPress={() => setSize(size === option ? '' : option)}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    size === option && styles.optionButtonTextActive,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Price Range</Text>
          <View style={styles.priceRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Min $"
              placeholderTextColor="#888"
              value={minPrice}
              onChangeText={setMinPrice}
              keyboardType="numeric"
            />
            <Text style={styles.priceSeparator}>-</Text>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Max $"
              placeholderTextColor="#888"
              value={maxPrice}
              onChangeText={setMaxPrice}
              keyboardType="numeric"
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    padding: 8,
    marginLeft: -8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
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
  optionButtonText: {
    color: '#888',
    fontSize: 14,
  },
  optionButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priceSeparator: {
    color: '#fff',
    fontSize: 18,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  searchButton: {
    backgroundColor: '#8B4513',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
