import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const insets = useSafeAreaInsets();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    console.log('=== REGISTRATION FLOW START ===');
    console.log('Register button clicked');
    console.log('Username:', username, 'Email:', email, 'Password length:', password.length);
    
    // Clear any previous errors
    setError('');
    
    if (!username || !email || !password) {
      console.log('❌ Validation failed: Missing fields');
      setError('Please fill in all fields');
      return;
    }

    // Basic email validation
    if (!email.includes('@')) {
      console.log('❌ Validation failed: Invalid email format');
      setError('Please enter a valid email address');
      return;
    }

    // Basic password validation
    if (password.length < 6) {
      console.log('❌ Validation failed: Password too short');
      setError('Password must be at least 6 characters');
      return;
    }

    console.log('✅ Validation passed');

    try {
      setLoading(true);
      console.log('⏳ Calling register API...');
      console.log('API endpoint: /auth/register');
      console.log('Payload:', { username: username.trim(), email: email.trim().toLowerCase() });
      
      await register(username.trim(), email.trim().toLowerCase(), password);
      
      console.log('✅ Registration successful!');
      console.log('Setting success state to true...');
      
      // Show success state
      setSuccess(true);
      setError('');
      console.log('Success state set to:', true);
      
      // Wait a moment to show the success message, then navigate
      setTimeout(() => {
        console.log('⏰ Timeout complete - Navigating to home...');
        router.replace('/(tabs)');
      }, 2000);
      
    } catch (error: any) {
      console.error('❌ Registration error caught:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setSuccess(false);
      const errorMessage = error.response?.data?.detail || error.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      // Also show alert for visibility
      Alert.alert('Registration Failed', errorMessage);
    } finally {
      console.log('Finally block - setting loading to false');
      setLoading(false);
      console.log('=== REGISTRATION FLOW END ===');
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join the cigar community</Text>

          {error && !success && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={24} color="#FF3B30" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {success && (
            <View style={styles.successContainer}>
              <Ionicons name="checkmark-circle" size={48} color="#4CAF50" />
              <Text style={styles.successTitle}>Account Created!</Text>
              <Text style={styles.successText}>Redirecting to home...</Text>
            </View>
          )}

          {!success && (
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Ionicons name="person" size={20} color="#888" />
                <TextInput
                  style={styles.input}
                  placeholder="Username"
                  placeholderTextColor="#888"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="mail" size={20} color="#888" />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="#888"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed" size={20} color="#888" />
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Password"
                    placeholderTextColor="#888"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    editable={!loading}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons 
                      name={showPassword ? "eye-off" : "eye"} 
                      size={24} 
                      color="#888" 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.registerButton, loading && styles.registerButtonDisabled]}
                onPress={handleRegister}
                disabled={loading}
              >
                <Text style={styles.registerButtonText}>
                  {loading ? 'Creating Account...' : 'Sign Up'}
                </Text>
              </TouchableOpacity>

              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.replace('/auth/login')}>
                  <Text style={styles.loginLink}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0c0c',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 32,
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  input: {
    flex: 1,
    height: 56,
    color: '#fff',
    fontSize: 16,
  },
  passwordContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    height: 56,
    color: '#fff',
    fontSize: 16,
  },
  eyeButton: {
    padding: 8,
  },
  passwordContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    height: 56,
    color: '#fff',
    fontSize: 16,
  },
  eyeButton: {
    padding: 8,
  },
  registerButton: {
    backgroundColor: '#8B4513',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  registerButtonDisabled: {
    backgroundColor: '#5a2d0a',
    opacity: 0.6,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  loginText: {
    color: '#888',
    fontSize: 14,
  },
  loginLink: {
    color: '#8B4513',
    fontSize: 14,
    fontWeight: 'bold',
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    marginTop: 24,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 16,
    marginBottom: 8,
  },
  successText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#2c1a1a',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FF3B30',
    gap: 12,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#FF3B30',
    fontWeight: '500',
  },
});
