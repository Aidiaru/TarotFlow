import React, { createContext, useContext, useState, useCallback, useRef, PropsWithChildren } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  title?: string;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showSuccess: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
  showError: () => {},
  showSuccess: () => {},
});

export const useToast = () => useContext(ToastContext);

const TOAST_CONFIG: Record<ToastType, { icon: string; bg: string; border: string; text: string }> = {
  error: {
    icon: '✕',
    bg: 'rgba(255, 59, 48, 0.12)',
    border: 'rgba(255, 59, 48, 0.3)',
    text: '#FF6B6B',
  },
  success: {
    icon: '✓',
    bg: 'rgba(52, 199, 89, 0.12)',
    border: 'rgba(52, 199, 89, 0.3)',
    text: '#5BDE7E',
  },
  warning: {
    icon: '⚠',
    bg: 'rgba(255, 159, 10, 0.12)',
    border: 'rgba(255, 159, 10, 0.3)',
    text: '#FFB347',
  },
  info: {
    icon: 'ℹ',
    bg: 'rgba(124, 92, 252, 0.12)',
    border: 'rgba(124, 92, 252, 0.3)',
    text: '#9B8AFF',
  },
};

export default function ToastProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const insets = useSafeAreaInsets();

  const showToast = useCallback((message: string, type: ToastType = 'info', title?: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
    setToasts(prev => [...prev, { id, message, type, title }]);

    if (type === 'error') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } else if (type === 'success') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (type === 'warning') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Auto dismiss
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const showError = useCallback((message: string, title?: string) => {
    showToast(message, 'error', title || 'Hata');
  }, [showToast]);

  const showSuccess = useCallback((message: string, title?: string) => {
    showToast(message, 'success', title);
  }, [showToast]);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, showError, showSuccess }}>
      {children}
      <View style={[styles.container, { top: insets.top + 8 }]} pointerEvents="box-none">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const translateY = useRef(new Animated.Value(-80)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const config = TOAST_CONFIG[toast.type];

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        tension: 80,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Animate out before removal
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -80,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          backgroundColor: config.bg,
          borderColor: config.border,
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <View style={[styles.iconCircle, { backgroundColor: config.border }]}>
        <Text style={[styles.iconText, { color: '#FFF' }]}>{config.icon}</Text>
      </View>
      <View style={styles.textWrap}>
        {toast.title && (
          <Text style={[styles.toastTitle, { color: config.text }]}>{toast.title}</Text>
        )}
        <Text style={styles.toastMessage} numberOfLines={3}>{toast.message}</Text>
      </View>
      <TouchableOpacity onPress={onDismiss} style={styles.closeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    gap: 8,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    // Glassmorphism
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 14,
    fontWeight: '800',
  },
  textWrap: {
    flex: 1,
  },
  toastTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  toastMessage: {
    fontSize: 13,
    color: '#D8D0E8',
    lineHeight: 18,
  },
  closeBtn: {
    padding: 4,
  },
  closeText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 14,
    fontWeight: '600',
  },
});
