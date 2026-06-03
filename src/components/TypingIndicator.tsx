import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

export default function TypingIndicator() {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const createPulse = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0.3,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );

    const anim = Animated.parallel([
      createPulse(dot1, 0),
      createPulse(dot2, 200),
      createPulse(dot3, 400),
    ]);
    anim.start();

    return () => anim.stop();
  }, []);

  const scale1 = dot1.interpolate({ inputRange: [0.3, 1], outputRange: [0.7, 1.15] });
  const scale2 = dot2.interpolate({ inputRange: [0.3, 1], outputRange: [0.7, 1.15] });
  const scale3 = dot3.interpolate({ inputRange: [0.3, 1], outputRange: [0.7, 1.15] });

  return (
    <View style={styles.container}>
      <View style={styles.bubble}>
        <Animated.View style={[styles.dot, { opacity: dot1, transform: [{ scale: scale1 }] }]} />
        <Animated.View style={[styles.dot, { opacity: dot2, transform: [{ scale: scale2 }] }]} />
        <Animated.View style={[styles.dot, { opacity: dot3, transform: [{ scale: scale3 }] }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 8,
    paddingLeft: 54, // Align with assistant messages (avatar width + gap)
  },
  bubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(20, 18, 40, 0.6)',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(124, 92, 252, 0.1)',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9B8AFF',
  },
});
