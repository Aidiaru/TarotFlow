import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthProvider, { useAuth } from './src/providers/AuthProvider';
import ToastProvider from './src/providers/ToastProvider';
import AuthScreen from './src/screens/AuthScreen';
import ChatScreen from './src/screens/ChatScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';

function RootNavigator() {
  const { session, isLoading } = useAuth();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const value = await AsyncStorage.getItem('@has_seen_onboarding');
        setHasSeenOnboarding(value === 'true');
      } catch (err) {
        setHasSeenOnboarding(false);
      }
    };
    checkOnboarding();
  }, []);

  const handleOnboardingComplete = async () => {
    await AsyncStorage.setItem('@has_seen_onboarding', 'true');
    setHasSeenOnboarding(true);
  };

  if (isLoading || hasSeenOnboarding === null) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#7C5CFC" />
      </View>
    );
  }

  if (!hasSeenOnboarding) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  return session ? <ChatScreen /> : <AuthScreen />;
}

import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <ToastProvider>
            <StatusBar barStyle="light-content" backgroundColor="#0A0A16" />
            <RootNavigator />
          </ToastProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A16',
  },
});
