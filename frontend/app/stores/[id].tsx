import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../../utils/api';

interface Store {
  store_name: string;
  price: number;
  url: string;
  in_stock: boolean;
}

export default function StoresScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStores();
  }, [id]);

  const loadStores = async () => {
    try {
      const response = await api.get(`/stores/${id}`);
      setStores(response.data);
    } catch (error) {
      console.error('Error loading stores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenStore = (url: string) => {
    Linking.openURL(url);
  };

  const sortedStores = [...stores].sort((a, b) => a.price - b.price);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.push('/(tabs)')}
          style={styles.backButton}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Where to Buy</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B4513" />
        </View>
      ) : (
        <ScrollView style={styles.content}>
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={24} color="#8B4513" />
            <Text style={styles.infoText}>
              {loading ? 'Fetching real-time prices...' : 'Prices fetched from retailer websites'}
            </Text>
          </View>

          {sortedStores.map((store, index) => (
            <View key={index} style={styles.storeCard}>
              <View style={styles.storeHeader}>
                <View style={styles.storeInfo}>
                  <Text style={styles.storeName}>{store.store_name}</Text>
                  {store.in_stock && store.price ? (
                    <View style={styles.stockBadge}>
                      <Text style={styles.stockText}>Price Found</Text>
                    </View>
                  ) : (
                    <View style={[styles.stockBadge, styles.stockBadgeOut]}>
                      <Text style={[styles.stockText, styles.stockTextOut]}>
                        Check Retailer
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.priceContainer}>
                  {store.price ? (
                    <>
                      <Text style={styles.priceSymbol}>$</Text>
                      <Text style={styles.price}>{store.price.toFixed(2)}</Text>
                    </>
                  ) : (
                    <Text style={styles.priceUnavailable}>—</Text>
                  )}
                </View>
              </View>

              <TouchableOpacity
                style={styles.visitButton}
                onPress={() => handleOpenStore(store.url)}
              >
                <Text style={styles.visitButtonText}>
                  {store.in_stock && store.price ? 'View on Website' : 'Search on Website'}
                </Text>
                <Ionicons name="open-outline" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}

          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>
              Prices and availability are subject to change. Please verify with the retailer.
            </Text>
          </View>
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
  backButton: {
    paddingVertical: 16,
    paddingLeft: 24,
    paddingRight: 16,
    marginLeft: -24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 12,
  },
  infoText: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
  },
  storeCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  storeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  stockBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stockBadgeOut: {
    backgroundColor: '#333',
  },
  stockText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  stockTextOut: {
    color: '#888',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  priceSymbol: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 2,
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  priceUnavailable: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#666',
  },
  visitButton: {
    flexDirection: 'row',
    backgroundColor: '#8B4513',
    padding: 14,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  visitButtonDisabled: {
    backgroundColor: '#333',
  },
  visitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  visitButtonTextDisabled: {
    color: '#888',
  },
  disclaimer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    marginBottom: 24,
  },
  disclaimerText: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
