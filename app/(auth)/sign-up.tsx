import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '@/components/auth/GlassCard';
import { FuturisticInput } from '@/components/auth/FuturisticInput';
import { GradientButton } from '@/components/auth/GradientButton';
import { Logo } from '@/components/auth/Logo';

const { width } = Dimensions.get('window');

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { signUp, isLoading, error } = useAuth();

  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let strength = 0;
    if (pass.length >= 8) strength += 1;
    if (/[A-Z]/.test(pass)) strength += 1;
    if (/[0-9]/.test(pass)) strength += 1;
    if (/[^A-Za-z0-9]/.test(pass)) strength += 1;
    return strength;
  };

  const passwordStrength = getPasswordStrength(password);

  const handleSignUp = () => {
    signUp(email, password, displayName);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar style="light" />
      <LinearGradient
        colors={['#1a237e', '#0d47a1', '#01579b']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Animated background circles */}
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />

        <View style={styles.content}>
          <Logo />

          <GlassCard style={styles.form}>
            <FuturisticInput
              icon="person-outline"
              placeholder="Display Name"
              value={displayName}
              onChangeText={setDisplayName}
              error={!!error}
            />

            <FuturisticInput
              icon="mail-outline"
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              error={!!error}
            />

            <FuturisticInput
              icon="lock-closed-outline"
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              error={!!error}
              style={{ marginBottom: error ? 8 : 16 }}
            />

            {password.length > 0 && (
              <View style={styles.passwordStrength}>
                <Text style={styles.passwordStrengthText}>
                  Password Strength: {['Weak', 'Fair', 'Good', 'Strong'][passwordStrength - 1] || 'Very Weak'}
                </Text>
                <View style={styles.strengthBar}>
                  {[...Array(4)].map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.strengthSegment,
                        index < passwordStrength && styles.strengthSegmentFilled,
                        index < passwordStrength && {
                          backgroundColor: ['#ff4444', '#ffd740', '#ffab40', '#00C853'][
                            passwordStrength - 1
                          ],
                        },
                      ]}
                    />
                  ))}
                </View>
              </View>
            )}

            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={20} color="#ff4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <GradientButton
              title="Create Account"
              onPress={handleSignUp}
              loading={isLoading}
              disabled={isLoading}
              style={styles.signUpButton}
            />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialButtons}>
              <GradientButton
                title="Google"
                variant="secondary"
                style={styles.socialButton}
                onPress={() => Alert.alert('Coming Soon', 'Google sign-up will be available soon!')}
              />
              <GradientButton
                title="Apple"
                variant="secondary"
                style={styles.socialButton}
                onPress={() => Alert.alert('Coming Soon', 'Apple sign-up will be available soon!')}
              />
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Link href="/sign-in" asChild>
                <TouchableOpacity>
                  <Text style={styles.link}>Sign In</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </GlassCard>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    position: 'relative',
  },
  circle: {
    position: 'absolute',
    borderRadius: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  circle1: {
    width: 400,
    height: 400,
    top: -200,
    left: -100,
    transform: [{ rotate: '45deg' }],
  },
  circle2: {
    width: 300,
    height: 300,
    top: 100,
    right: -150,
    transform: [{ rotate: '30deg' }],
  },
  circle3: {
    width: 200,
    height: 200,
    bottom: -50,
    left: -50,
    transform: [{ rotate: '60deg' }],
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  signUpButton: {
    marginTop: 8,
  },
  passwordStrength: {
    marginBottom: 16,
  },
  passwordStrengthText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  strengthBar: {
    flexDirection: 'row',
    height: 4,
    backgroundColor: '#f5f5f5',
    borderRadius: 2,
    overflow: 'hidden',
    gap: 4,
  },
  strengthSegment: {
    flex: 1,
    backgroundColor: '#e0e0e0',
  },
  strengthSegmentFilled: {
    backgroundColor: '#4CAF50',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffe5e5',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#ff4444',
    marginLeft: 8,
    fontSize: 14,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    color: '#666',
    paddingHorizontal: 10,
    fontSize: 14,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  socialButton: {
    width: '48%',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: '#666',
    fontSize: 14,
  },
  link: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
