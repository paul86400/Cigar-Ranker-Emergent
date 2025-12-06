import React, { useState, useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated } from 'react-native';
import { Stack } from 'expo-router';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function AppContent() {
  const { loading: authLoading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    async function prepare() {
      try {
        // Fade in animation
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start();

        // Wait for minimum display time (2 seconds after fade in)
        await new Promise(resolve => setTimeout(resolve, 2800));
        setMinTimeElapsed(true);
      } catch (e) {
        console.warn(e);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    // Only hide splash when both auth is loaded AND minimum time has elapsed
    if (!authLoading && minTimeElapsed && showSplash) {
      // Fade out animation
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }).start(() => {
        setShowSplash(false);
        SplashScreen.hideAsync();
      });
    }
  }, [authLoading, minTimeElapsed, showSplash]);

  if (showSplash) {
    return (
      <View style={styles.splashContainer}>
        <Animated.View style={[styles.splashImageContainer, { opacity: fadeAnim }]}>
          <Image
            source={require('../assets/splash.png')}
            style={styles.splashImage}
            resizeMode="cover"
          />
        </Animated.View>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="auth/login" options={{ presentation: 'modal' }} />
      <Stack.Screen name="auth/register" options={{ presentation: 'modal' }} />
      <Stack.Screen name="cigar/[id]" />
      <Stack.Screen name="comments/[id]" />
      <Stack.Screen name="stores/[id]" />
      <Stack.Screen name="camera" options={{ presentation: 'fullScreenModal' }} />
      <Stack.Screen name="search" options={{ presentation: 'modal' }} />
      <Stack.Screen name="my-ratings" />
      <Stack.Screen name="my-comments" />
      <Stack.Screen name="add-cigar" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#0c0c0c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashImageContainer: {
    width: '100%',
    height: '100%',
  },
  splashImage: {
    width: '100%',
    height: '100%',
  },
});