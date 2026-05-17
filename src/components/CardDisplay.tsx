import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import type { TarotCard } from '../types';

interface CardDisplayProps {
  cards: TarotCard[];
}

// Card suit visuals
function getCardSuit(name: string): { symbol: string; colors: [string, string]; glow: string } {
  if (name.includes('Wand')) return { symbol: '🪄', colors: ['#2A1A0E', '#1A0D05'], glow: '#FF7B54' };
  if (name.includes('Cup')) return { symbol: '🏆', colors: ['#0E1A2A', '#05101A'], glow: '#5B9BD5' };
  if (name.includes('Sword')) return { symbol: '⚔️', colors: ['#1A1A22', '#0E0E14'], glow: '#A0A0C8' };
  if (name.includes('Pentacle')) return { symbol: '⭐', colors: ['#2A2A0E', '#1A1A05'], glow: '#D4AF37' };
  // Major Arcana
  return { symbol: '✦', colors: ['#1A0E2A', '#0D0520'], glow: '#B388FF' };
}

export default function CardDisplay({ cards }: CardDisplayProps) {
  const anims = useRef(cards.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations = anims.map((anim, i) =>
      Animated.spring(anim, {
        toValue: 1,
        delay: i * 100,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      })
    );
    Animated.stagger(80, animations).start();
  }, []);

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
        {cards.map((card, index) => {
          const { symbol, colors, glow } = getCardSuit(card.name);
          const scale = anims[index]?.interpolate({
            inputRange: [0, 1],
            outputRange: [0.5, 1],
          }) || 1;
          const opacity = anims[index] || 1;

          return (
            <Animated.View
              key={index}
              style={[styles.cardWrapper, { opacity, transform: [{ scale: scale as any }] }]}
            >
              <LinearGradient
                colors={colors as [string, string]}
                style={[
                  styles.card,
                  {
                    borderColor: card.is_reversed ? '#FF6B6B' : glow,
                    shadowColor: card.is_reversed ? '#FF6B6B' : glow,
                  },
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.position}>{index + 1}</Text>

                {/* Corner decorations */}
                <Text style={[styles.corner, styles.cornerTL, { color: glow + '30' }]}>✦</Text>
                <Text style={[styles.corner, styles.cornerBR, { color: glow + '30' }]}>✦</Text>

                <Text
                  style={[
                    styles.symbol,
                    card.is_reversed && styles.reversed,
                  ]}
                >
                  {symbol}
                </Text>
                <Text style={styles.cardName} numberOfLines={2}>
                  {card.name_tr}
                </Text>
                <Text style={styles.cardNameEn} numberOfLines={1}>
                  {card.name}
                </Text>
                {card.is_reversed && (
                  <View style={styles.reversedBadge}>
                    <Text style={styles.reversedText}>TERS</Text>
                  </View>
                )}
              </LinearGradient>
            </Animated.View>
          );
        })}
      </ScrollView>
    </View>
  );
}

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
    gap: 10,
  },
  cardWrapper: {
    // For animation
  },
  card: {
    width: 90,
    height: 130,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  position: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: 9,
    fontWeight: '800',
    position: 'absolute',
    top: 6,
    left: 8,
    letterSpacing: 0.5,
  },
  corner: {
    position: 'absolute',
    fontSize: 8,
  },
  cornerTL: { top: 4, right: 6 },
  cornerBR: { bottom: 4, left: 6 },
  symbol: {
    fontSize: 28,
    marginBottom: 6,
  },
  reversed: {
    transform: [{ rotate: '180deg' }],
  },
  cardName: {
    color: '#E8E0D0',
    fontSize: 10,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 13,
  },
  cardNameEn: {
    color: 'rgba(255,255,255,0.2)',
    fontSize: 8,
    textAlign: 'center',
    marginTop: 2,
    fontStyle: 'italic',
  },
  reversedBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 107, 107, 0.4)',
  },
  reversedText: {
    color: '#FF6B6B',
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
