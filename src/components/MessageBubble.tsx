import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  if (!isUser) {
    // Assistant: ChatGPT-style full-width with avatar
    return (
      <View style={styles.assistantRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>🔮</Text>
        </View>
        <View style={styles.assistantContent}>
          <Text style={styles.assistantLabel}>Tarot Flow</Text>
          <Text style={styles.assistantText} selectable>
            {message.content}
          </Text>
          <Text style={styles.assistantTime}>
            {new Date(message.created_at).toLocaleTimeString('tr-TR', {
              hour: '2-digit', minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    );
  }

  // User: right-aligned bubble
  return (
    <View style={styles.userRow}>
      <View style={styles.userBubble}>
        <Text style={styles.userText}>{message.content}</Text>
        <Text style={styles.userTime}>
          {new Date(message.created_at).toLocaleTimeString('tr-TR', {
            hour: '2-digit', minute: '2-digit',
          })}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Assistant — full width, ChatGPT-like
  assistantRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
    alignItems: 'flex-start',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1E1E3A',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  avatarText: {
    fontSize: 14,
  },
  assistantContent: {
    flex: 1,
  },
  assistantLabel: {
    fontSize: 11,
    color: '#6C5CE7',
    fontWeight: '600',
    marginBottom: 4,
  },
  assistantText: {
    fontSize: 15,
    lineHeight: 23,
    color: '#E0E0E0',
  },
  assistantTime: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.25)',
    marginTop: 6,
  },

  // User — right-aligned bubble
  userRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  userBubble: {
    maxWidth: '78%',
    backgroundColor: '#6C5CE7',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderBottomRightRadius: 4,
  },
  userText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#FFFFFF',
  },
  userTime: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.45)',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
});
