import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'TarotFlow\'a Hoş Geldin',
    description: 'Kartlar seni tanımaya başlasın. Mistik deneyime adım at ve niyetini evrene sun.',
    emoji: '🔮',
  },
  {
    id: '2',
    title: 'Kişiselleştirilmiş Yolculuk',
    description: 'Her sohbetin, her niyetin, bir sonraki açılımı senin enerjine göre şekillendirir. Bu senin özel günlüğün.',
    emoji: '📜',
  },
  {
    id: '3',
    title: 'Sezgilerine Güven',
    description: 'Kararsız kaldığın anlarda derin bir nefes al. Kartların bilgeliği sana rehberlik edecek.',
    emoji: '✨',
  },
];

interface OnboardingScreenProps {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList>(null);

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems[0]) {
      setCurrentIndex(viewableItems[0].index);
      Haptics.selectionAsync();
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollToNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onComplete();
    }
  };

  const renderItem = ({ item }: { item: typeof SLIDES[0] }) => {
    return (
      <View style={styles.slide}>
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>{item.emoji}</Text>
        </View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0A0A16', '#140E28', '#0A0A16']}
        style={StyleSheet.absoluteFillObject}
      />
      
      <View style={styles.listContainer}>
        <FlatList
          data={SLIDES}
          renderItem={renderItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          keyExtractor={(item) => item.id}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={32}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
          ref={slidesRef}
        />
      </View>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {SLIDES.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 20, 8],
              extrapolate: 'clamp',
            });
            
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                style={[styles.dot, { width: dotWidth, opacity }]}
                key={i.toString()}
              />
            );
          })}
        </View>

        <TouchableOpacity 
          style={styles.button}
          onPress={scrollToNext}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#8A2BE2', '#4B0082']}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.buttonText}>
              {currentIndex === SLIDES.length - 1 ? 'Başla' : 'İleri'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A16',
  },
  listContainer: {
    flex: 3,
  },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emojiContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(138, 43, 226, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    borderWidth: 1,
    borderColor: 'rgba(138, 43, 226, 0.3)',
    shadowColor: '#8A2BE2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  emoji: {
    fontSize: 60,
  },
  title: {
    fontWeight: '800',
    fontSize: 28,
    marginBottom: 16,
    color: '#FFF',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  description: {
    fontWeight: '400',
    fontSize: 16,
    color: '#A0A0C0',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    paddingBottom: 60,
  },
  pagination: {
    flexDirection: 'row',
    height: 10,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9B8AFF',
  },
  button: {
    marginTop: 20,
    shadowColor: '#8A2BE2',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonGradient: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
