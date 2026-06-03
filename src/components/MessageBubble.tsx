import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import SimpleMarkdown from './SimpleMarkdown';
import { useToast } from '../providers/ToastProvider';
import type { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const { showSuccess } = useToast();
  const isUser = message.role === 'user';
  const timeStr = new Date(message.created_at).toLocaleTimeString('tr-TR', {
    hour: '2-digit', minute: '2-digit',
  });

  const handleCopy = async () => {
    await Clipboard.setStringAsync(message.content);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    showSuccess('Mesaj kopyalandı');
  };

  const handleShare = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await Share.share({
        message: `TarotFlow:\n\n${message.content}`,
      });
    } catch (error) {
      console.log(error);
    }
  };

  if (!isUser) {
    return (
      <View style={styles.assistantRow}>
        <View style={styles.avatarGlow}>
          <LinearGradient
            colors={['#1E1040', '#0D0520']}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>🔮</Text>
          </LinearGradient>
        </View>
        <View style={styles.assistantContent}>
          <View style={styles.assistantHeader}>
            <Text style={styles.assistantLabel}>TarotFlow</Text>
            <Text style={styles.assistantTime}>{timeStr}</Text>
          </View>
          <TouchableOpacity activeOpacity={0.8} onLongPress={handleCopy} delayLongPress={500} style={styles.assistantBubble}>
            <View style={styles.accentBorder} />
            <SimpleMarkdown text={message.content} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
            <Text style={styles.shareIcon}>➦ Paylaş</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.userRow}>
      <View style={styles.userBubbleWrap}>
        <TouchableOpacity activeOpacity={0.8} onLongPress={handleCopy} delayLongPress={500}>
          <LinearGradient
            colors={['#7C5CFC', '#5B3FD4']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.userBubble}
          >
            <Text style={styles.userText}>{message.content}</Text>
            <Text style={styles.userTime}>{timeStr}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Assistant
  assistantRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 10,
    alignItems: 'flex-start',
  },
  avatarGlow: {
    shadowColor: '#7C5CFC',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 2,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(124, 92, 252, 0.3)',
  },
  avatarText: {
    fontSize: 14,
  },
  assistantContent: {
    flex: 1,
  },
  assistantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  assistantLabel: {
    fontSize: 11,
    color: '#9B8AFF',
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  assistantTime: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.18)',
  },
  assistantBubble: {
    flexDirection: 'row',
  },
  accentBorder: {
    width: 2.5,
    backgroundColor: 'rgba(124, 92, 252, 0.25)',
    borderRadius: 2,
    marginRight: 12,
  },
  shareBtn: {
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(124, 92, 252, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(124, 92, 252, 0.2)',
  },
  shareIcon: {
    color: '#9B8AFF',
    fontSize: 11,
    fontWeight: '600',
  },

  // User
  userRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  userBubbleWrap: {
    maxWidth: '78%',
    shadowColor: '#7C5CFC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  userBubble: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 20,
    borderBottomRightRadius: 6,
  },
  userText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#FFFFFF',
  },
  userTime: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
});
