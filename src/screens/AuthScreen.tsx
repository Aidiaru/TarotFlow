import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Animated,
} from 'react-native';
import { useAuth } from '../providers/AuthProvider';
import { useToast } from '../providers/ToastProvider';
import { LinearGradient } from 'expo-linear-gradient';

// Human-readable error mapping
const ERROR_MAP: Record<string, string> = {
  'Invalid login credentials': 'Email veya şifre hatalı.',
  'User already registered': 'Bu email zaten kayıtlı. Giriş yapmayı dene.',
  'Email not confirmed': 'Email adresini henüz onaylamamışsın. Gelen kutunu kontrol et.',
  'Password should be at least 6 characters': 'Şifre en az 6 karakter olmalı.',
  'Unable to validate email address: invalid format': 'Geçerli bir email adresi gir.',
  'Email rate limit exceeded': 'Çok fazla deneme yaptın. Biraz bekle.',
  'For security purposes, you can only request this after': 'Güvenlik sebebiyle biraz beklemelisin.',
};

function humanizeError(message: string): string {
  for (const [key, value] of Object.entries(ERROR_MAP)) {
    if (message.includes(key)) return value;
  }
  return message;
}

export default function AuthScreen() {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const { showError, showSuccess, showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Inline validation errors
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const emailBorderAnim = useRef(new Animated.Value(0)).current;
  const passwordBorderAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 4, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const flashBorder = (anim: Animated.Value) => {
    Animated.sequence([
      Animated.timing(anim, { toValue: 1, duration: 200, useNativeDriver: false }),
      Animated.timing(anim, { toValue: 0, duration: 2000, useNativeDriver: false }),
    ]).start();
  };

  const validate = (): boolean => {
    let valid = true;
    setEmailError('');
    setPasswordError('');

    if (!email.trim()) {
      setEmailError('Email adresi gerekli');
      flashBorder(emailBorderAnim);
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Geçerli bir email adresi gir');
      flashBorder(emailBorderAnim);
      valid = false;
    }

    if (!password) {
      setPasswordError('Şifre gerekli');
      flashBorder(passwordBorderAnim);
      valid = false;
    } else if (password.length < 6) {
      setPasswordError('Şifre en az 6 karakter olmalı');
      flashBorder(passwordBorderAnim);
      valid = false;
    }

    if (!valid) shake();
    return valid;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    const { error } = isLogin
      ? await signIn(email, password)
      : await signUp(email, password);

    if (error) {
      const msg = humanizeError(error.message);
      showError(msg);
      shake();
    } else if (!isLogin) {
      showSuccess('Hesabın oluşturuldu! Email onayını kontrol et.', '✨ Hoş geldin');
      setIsLogin(true);
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      showError(humanizeError(error.message));
    }
    setLoading(false);
  };

  const emailBorderColor = emailBorderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(138, 43, 226, 0.2)', 'rgba(255, 59, 48, 0.6)'],
  });

  const passwordBorderColor = passwordBorderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(138, 43, 226, 0.2)', 'rgba(255, 59, 48, 0.6)'],
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#0A0A16', '#140E28', '#0A0A16']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.animatedContainer,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { translateX: shakeAnim }] }
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logo}>🔮</Text>
            </View>
            <Text style={styles.title}>TarotFlow</Text>
            <Text style={styles.subtitle}>
              Kartlar seni tanımaya başlasın
            </Text>
          </View>

          {/* Social Login Buttons */}
          <View style={styles.socialSection}>
            <TouchableOpacity
              style={styles.googleButton}
              onPress={handleGoogleSignIn}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleButtonText}>Google ile devam et</Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>veya email ile</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Email Form */}
          <View style={styles.form}>
            <View>
              <Animated.View style={[styles.inputContainer, { borderColor: emailBorderColor }]}>
                <TextInput
                  style={styles.input}
                  placeholder="Email adresin"
                  placeholderTextColor="#7A7A9D"
                  value={email}
                  onChangeText={(t) => { setEmail(t); setEmailError(''); }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                />
              </Animated.View>
              {emailError ? <Text style={styles.fieldError}>{emailError}</Text> : null}
            </View>

            <View>
              <Animated.View style={[styles.inputContainer, { borderColor: passwordBorderColor }]}>
                <TextInput
                  style={[styles.input, { paddingRight: 50 }]}
                  placeholder="Şifren"
                  placeholderTextColor="#7A7A9D"
                  value={password}
                  onChangeText={(t) => { setPassword(t); setPasswordError(''); }}
                  secureTextEntry={!showPassword}
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁'}</Text>
                </TouchableOpacity>
              </Animated.View>
              {passwordError ? <Text style={styles.fieldError}>{passwordError}</Text> : null}
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.buttonContainer}
              onPress={handleSubmit}
              disabled={loading}
            >
              <LinearGradient
                colors={loading ? ['#5B3FD4', '#3A2690'] : ['#8A2BE2', '#4B0082']}
                style={styles.primaryButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.buttonText}>
                    {isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => { setIsLogin(!isLogin); setEmailError(''); setPasswordError(''); }}
              style={styles.switchButton}
            >
              <Text style={styles.switchText}>
                {isLogin ? 'Hesabın yok mu? Kayıt ol' : 'Hesabın var mı? Giriş yap'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A16',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 40,
  },
  animatedContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 44,
  },
  logoContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(138, 43, 226, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(138, 43, 226, 0.3)',
    shadowColor: '#8A2BE2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  logo: {
    fontSize: 48,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#A0A0C0',
    fontWeight: '400',
  },

  // Social
  socialSection: {
    marginBottom: 8,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    gap: 12,
  },
  googleIcon: {
    fontSize: 20,
    fontWeight: '800',
    color: '#4285F4',
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },

  // Form
  form: {
    gap: 16,
  },
  inputContainer: {
    backgroundColor: 'rgba(30, 25, 45, 0.6)',
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  eyeBtn: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  eyeIcon: {
    fontSize: 18,
  },
  fieldError: {
    color: '#FF6B6B',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 6,
    marginLeft: 16,
  },
  buttonContainer: {
    marginTop: 8,
    shadowColor: '#8A2BE2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  switchButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 4,
  },
  switchText: {
    color: '#B28DFF',
    fontSize: 15,
    fontWeight: '600',
  },

  // Dividers
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dividerText: {
    color: '#7A7A9D',
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: '500',
  },
});
