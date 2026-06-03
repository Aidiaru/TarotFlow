import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Animated, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { getCardImage } from '../utils/cardImages';
import type { TarotCard } from '../types';

interface CardDisplayProps {
  cards: TarotCard[];
}

export default function CardDisplay({ cards }: CardDisplayProps) {
  if (!cards || cards.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLine} />
        <Text style={styles.title}>✦  Çekilen Kartlar  ✦</Text>
        <View style={styles.headerLine} />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {cards.map((card, index) => (
          <FlipCard key={index} card={card} index={index} />
        ))}
      </ScrollView>
    </View>
  );
}

function FlipCard({ card, index }: { card: TarotCard; index: number }) {
  const flipAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const [isFlipped, setIsFlipped] = useState(false);
  const cardImage = getCardImage(card.name);

  useEffect(() => {
    // Entry animation: scale in with delay per card
    const delay = index * 200;
    
    Animated.sequence([
      Animated.delay(delay),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-flip after entry animation completes
    setTimeout(() => {
      setIsFlipped(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Animated.spring(flipAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();
    }, delay + 600);
  }, []);

  const handleTap = () => {
    // Toggle flip on tap
    const toValue = isFlipped ? 0 : 1;
    setIsFlipped(!isFlipped);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.spring(flipAnim, {
      toValue,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  // Interpolate rotation
  const frontRotateY = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });
  const backRotateY = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });
  const frontOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 0.5, 1],
    outputRange: [1, 1, 0, 0],
  });
  const backOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 0.5, 1],
    outputRange: [0, 0, 1, 1],
  });

  const glowColor = card.is_reversed ? '#FF6B6B' : '#B388FF';

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={handleTap}>
      <Animated.View style={[styles.cardWrapper, { transform: [{ scale: scaleAnim }] }]}>
        {/* FRONT — Card Back (mystical design) */}
        <Animated.View
          style={[
            styles.cardFace,
            {
              transform: [{ perspective: 800 }, { rotateY: frontRotateY }],
              opacity: frontOpacity,
            },
          ]}
        >
          <LinearGradient
            colors={['#1A0E2A', '#0D0520', '#1A0E2A']}
            style={[styles.card, styles.cardBack]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.backDesign}>
              <Text style={styles.backSymbol}>✦</Text>
              <View style={styles.backBorder}>
                <Text style={styles.backStar}>☽</Text>
              </View>
              <Text style={[styles.backSymbol, { fontSize: 10 }]}>TarotFlow</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* BACK — Card Face (actual tarot image) */}
        <Animated.View
          style={[
            styles.cardFace,
            styles.cardFaceBack,
            {
              transform: [{ perspective: 800 }, { rotateY: backRotateY }],
              opacity: backOpacity,
            },
          ]}
        >
          <View
            style={[
              styles.card,
              styles.cardFront,
              {
                borderColor: card.is_reversed ? '#FF6B6B' : 'rgba(179, 136, 255, 0.4)',
                shadowColor: glowColor,
              },
            ]}
          >
            {cardImage ? (
              <Image
                source={cardImage}
                style={[
                  styles.cardImage,
                  card.is_reversed && styles.cardImageReversed,
                ]}
                resizeMode="cover"
              />
            ) : (
              // Fallback if image not found
              <View style={styles.fallbackCard}>
                <Text style={styles.fallbackSymbol}>🔮</Text>
              </View>
            )}
            {/* Card name overlay */}
            <LinearGradient
              colors={['transparent', 'rgba(10, 5, 20, 0.95)']}
              style={styles.nameOverlay}
            >
              <Text style={styles.cardName} numberOfLines={2}>
                {card.name_tr}
              </Text>
              <Text style={styles.cardNameEn} numberOfLines={1}>
                {card.name}
              </Text>
            </LinearGradient>
            {card.is_reversed && (
              <View style={styles.reversedBadge}>
                <Text style={styles.reversedText}>TERS</Text>
              </View>
            )}
            {/* Position indicator */}
            <View style={styles.positionBadge}>
              <Text style={styles.positionText}>{index + 1}</Text>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const CARD_WIDTH = 110;
const CARD_HEIGHT = 175;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 14,
    paddingLeft: 52,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
    paddingRight: 16,
  },
  headerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
  },
  title: {
    color: '#D4AF37',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  scrollContent: {
    paddingRight: 16,
    gap: 12,
  },

  // Card wrapper
  cardWrapper: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  cardFace: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backfaceVisibility: 'hidden',
  },
  cardFaceBack: {
    // Positioned on top
  },

  // Card shared
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 10,
    borderWidth: 1.5,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },

  // Card back (mystical design)
  cardBack: {
    borderColor: 'rgba(124, 92, 252, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#7C5CFC',
  },
  backDesign: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  backSymbol: {
    color: 'rgba(179, 136, 255, 0.5)',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 2,
  },
  backBorder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(179, 136, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backStar: {
    color: 'rgba(179, 136, 255, 0.4)',
    fontSize: 24,
  },

  // Card front (image)
  cardFront: {
    backgroundColor: '#0A0516',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  cardImageReversed: {
    transform: [{ rotate: '180deg' }],
  },

  // Fallback
  fallbackCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A0E2A',
  },
  fallbackSymbol: {
    fontSize: 32,
  },

  // Name overlay
  nameOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 8,
    paddingBottom: 8,
    paddingTop: 24,
  },
  cardName: {
    color: '#F0E6FF',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 14,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  cardNameEn: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 8,
    textAlign: 'center',
    marginTop: 2,
    fontStyle: 'italic',
  },

  // Badges
  reversedBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(255, 107, 107, 0.85)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  reversedText: {
    color: '#FFF',
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  positionBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(179, 136, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  positionText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 9,
    fontWeight: '800',
  },
});
