import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import type { TarotCard } from '../types';

interface CardDisplayProps {
  cards: TarotCard[];
}

// Simple card symbol based on suit
function getCardSymbol(name: string): { symbol: string; color: string } {
  if (name.includes('Wand')) return { symbol: '🪄', color: '#FF7B54' };
  if (name.includes('Cup')) return { symbol: '🏆', color: '#5B9BD5' };
  if (name.includes('Sword')) return { symbol: '⚔️', color: '#A0A0B8' };
  if (name.includes('Pentacle')) return { symbol: '⭐', color: '#FFD700' };
  // Major Arcana
  return { symbol: '✦', color: '#B388FF' };
}

export default function CardDisplay({ cards }: CardDisplayProps) {
  if (!cards || cards.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerIcon}>✦</Text>
        <Text style={styles.title}>Çekilen Kartlar</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {cards.map((card, index) => {
          const { symbol, color } = getCardSymbol(card.name);
          return (
            <View
              key={index}
              style={[styles.card, { borderColor: card.is_reversed ? '#FF6B6B' : color }]}
            >
              <Text style={styles.position}>{index + 1}</Text>
              <Text
                style={[
                  styles.symbol,
                  card.is_reversed && styles.reversed,
                  { color },
                ]}
              >
                {symbol}
              </Text>
              <Text style={styles.cardName} numberOfLines={2}>
                {card.name_tr}
              </Text>
              {card.is_reversed && (
                <View style={styles.reversedBadge}>
                  <Text style={styles.reversedText}>TERS</Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    paddingLeft: 52, // Aligned with message content (avatar + gap)
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  headerIcon: {
    fontSize: 12,
    color: '#6C5CE7',
  },
  title: {
    color: '#6C5CE7',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingRight: 16,
    gap: 8,
  },
  card: {
    width: 78,
    height: 108,
    backgroundColor: '#151530',
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  position: {
    color: '#555',
    fontSize: 9,
    fontWeight: '700',
    position: 'absolute',
    top: 4,
    left: 6,
  },
  symbol: {
    fontSize: 24,
    marginBottom: 6,
  },
  reversed: {
    transform: [{ rotate: '180deg' }],
  },
  cardName: {
    color: '#CCC',
    fontSize: 10,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 13,
  },
  reversedBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#FF6B6B22',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  reversedText: {
    color: '#FF6B6B',
    fontSize: 7,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
