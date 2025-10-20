import { Stack } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="auth/login" options={{ presentation: 'modal' }} />
          <Stack.Screen name="auth/register" options={{ presentation: 'modal' }} />
          <Stack.Screen name="cigar/[id]" />
          <Stack.Screen name="comments/[id]" />
          <Stack.Screen name="stores/[id]" />
          <Stack.Screen name="camera" options={{ presentation: 'fullScreenModal' }} />
          <Stack.Screen name="search" options={{ presentation: 'modal' }} />
        </Stack>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}