import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Animated,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../providers/AuthProvider';
import MessageBubble from '../components/MessageBubble';
import CardDisplay from '../components/CardDisplay';
import {
  createSession,
  getSessions,
  getMessages,
  saveMessage,
  requestTarotReading,
  endSession,
  deleteSession,
  updateSessionTitle,
  triggerSessionReflection,
} from '../services/tarotService';
import type { Message, Session } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_WIDTH * 0.80;

export default function ChatScreen() {
  const { user, signOut } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [retryPayload, setRetryPayload] = useState<{ question: string, history: any[] } | null>(null);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const drawerAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;

  useEffect(() => {
    if (user) loadSessionsAndInit();
  }, [user]);

  const loadSessionsAndInit = async () => {
    try {
      const existing = await getSessions(user!.id);
      setSessions(existing);
      const active = existing.find((s) => s.status === 'active');
      if (active) {
        await loadSession(active);
      } else {
        await startNewSession();
      }
    } catch (error: any) {
      Alert.alert('Hata', error.message);
    }
  };

  const loadSession = async (session: Session) => {
    setCurrentSession(session);
    try {
      const msgs = await getMessages(session.id);
      setMessages(msgs);
      closeDrawer();
      scrollToBottom();
    } catch (error: any) {
      Alert.alert('Hata', error.message);
    }
  };

  const startNewSession = async () => {
    try {
      const session = await createSession(user!.id);
      setCurrentSession(session);
      setMessages([]);
      setSessions((prev) => [session, ...prev]);
      closeDrawer();
    } catch (error: any) {
      Alert.alert('Hata', error.message);
    }
  };

  const handleDeleteSession = (session: Session) => {
    Alert.alert(
      'Sohbeti Sil',
      'Bu sohbet kalıcı olarak silinecek. Emin misin?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSession(session.id);
              setSessions((prev) => prev.filter((s) => s.id !== session.id));
              if (currentSession?.id === session.id) {
                const remaining = sessions.filter((s) => s.id !== session.id);
                if (remaining.length > 0) {
                  await loadSession(remaining[0]);
                } else {
                  await startNewSession();
                }
              }
            } catch (error: any) {
              Alert.alert('Hata', error.message);
            }
          },
        },
      ]
    );
  };

  // Auto-generate title from first message
  const autoTitle = (message: string): string => {
    const cleaned = message.trim();
    if (cleaned.length <= 30) return cleaned;
    // Cut at word boundary
    const cut = cleaned.substring(0, 30);
    const lastSpace = cut.lastIndexOf(' ');
    return (lastSpace > 15 ? cut.substring(0, lastSpace) : cut) + '...';
  };

  // Drawer
  const openDrawer = () => {
    setDrawerOpen(true);
    Animated.spring(drawerAnim, {
      toValue: 0, useNativeDriver: true, tension: 65, friction: 11,
    }).start();
  };

  const closeDrawer = () => {
    Animated.spring(drawerAnim, {
      toValue: -DRAWER_WIDTH, useNativeDriver: true, tension: 65, friction: 11,
    }).start(() => setDrawerOpen(false));
  };

  const scrollToBottom = () => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 150);
  };

  const sendMessage = async () => {
    if (!inputText.trim() || !currentSession || !user) return;

    const userMessage = inputText.trim();
    setInputText('');
    Keyboard.dismiss();
    setRetryPayload(null);

    try {
      // Auto-title on first message
      const isFirstMessage = messages.length === 0;

      const savedUserMsg = await saveMessage(
        currentSession.id, user.id, 'user', userMessage
      );
      setMessages((prev) => [...prev, savedUserMsg]);
      scrollToBottom();

      // Update session title on first user message
      if (isFirstMessage) {
        const title = autoTitle(userMessage);
        await updateSessionTitle(currentSession.id, title);
        setCurrentSession((prev) => prev ? { ...prev, title } : prev);
        setSessions((prev) =>
          prev.map((s) => s.id === currentSession.id ? { ...s, title } : s)
        );
      }

      const messageHistory = messages.map((m) => ({
        role: m.role, content: m.content,
      }));

      await fetchReading(userMessage, messageHistory);
    } catch (error: any) {
      Alert.alert('Hata', 'Mesaj gönderilemedi: ' + error.message);
    }
  };

  const fetchReading = async (question: string, history: any[]) => {
    if (!currentSession || !user) return;
    try {
      setLoading(true);
      setRetryPayload(null);

      const response = await requestTarotReading({
        session_id: currentSession.id,
        question: question,
        message_history: [...history, { role: 'user', content: question }],
      });

      const newAssistantMsg: Message = {
        id: response.message_id || Math.random().toString(),
        session_id: currentSession.id,
        user_id: user.id,
        role: 'assistant',
        content: response.reading,
        metadata: { cards: response.cards },
        created_at: new Date().toISOString()
      };
      setMessages((prev) => [...prev, newAssistantMsg]);
      scrollToBottom();
    } catch (error: any) {
      setRetryPayload({ question, history });
      Alert.alert('Yoğunluk', error.message || 'Bağlantı kurulamadı.');
    } finally {
      setLoading(false);
    }
  };

  const handleEndSession = async () => {
    if (!currentSession) return;
    Alert.alert(
      'Oturumu Bitir',
      'Bu oturum kapatılacak ve kartlar hafızaya alınacak.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Bitir & Analiz Et',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await endSession(currentSession.id);
              await triggerSessionReflection({ session_id: currentSession.id });
              setSessions((prev) =>
                prev.map((s) =>
                  s.id === currentSession.id ? { ...s, status: 'completed' as const } : s
                )
              );
              Alert.alert('✨ Tamamlandı', 'Oturum analizi kaydedildi.');
              await startNewSession();
            } catch (error: any) {
              Alert.alert('Hata', error.message);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const hasCards = item.metadata?.cards && item.metadata.cards.length > 0;
    return (
      <View>
        {hasCards && <CardDisplay cards={item.metadata.cards} />}
        <MessageBubble message={item} />
      </View>
    );
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const mins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMs / 3600000);
    const days = Math.floor(diffMs / 86400000);
    if (mins < 1) return 'Şimdi';
    if (mins < 60) return `${mins}dk`;
    if (hours < 24) return `${hours}sa`;
    if (days < 7) return `${days}g`;
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
  };

  // Group sessions by time
  const groupSessions = () => {
    const today: Session[] = [];
    const week: Session[] = [];
    const older: Session[] = [];
    const now = Date.now();

    for (const s of sessions) {
      const age = now - new Date(s.created_at).getTime();
      if (age < 86400000) today.push(s);
      else if (age < 604800000) week.push(s);
      else older.push(s);
    }

    return { today, week, older };
  };

  const { today, week, older } = groupSessions();

  const renderSessionGroup = (title: string, items: Session[]) => {
    if (items.length === 0) return null;
    return (
      <View key={title}>
        <Text style={styles.groupTitle}>{title}</Text>
        {items.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.sessionItem,
              currentSession?.id === item.id && styles.sessionItemActive,
            ]}
            onPress={() => loadSession(item)}
            onLongPress={() => handleDeleteSession(item)}
          >
            <View style={styles.sessionItemRow}>
              <Text style={styles.sessionItemIcon}>
                {item.status === 'active' ? '🔮' : '📜'}
              </Text>
              <View style={styles.sessionItemTextWrap}>
                <Text style={styles.sessionItemTitle} numberOfLines={1}>
                  {item.title || 'Yeni Oturum'}
                </Text>
                <Text style={styles.sessionItemMeta}>
                  {formatDate(item.created_at)}
                  {item.status === 'completed' && ' • tamamlandı'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteSession(item)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.deleteIcon}>✕</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* DRAWER OVERLAY */}
      {drawerOpen && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={closeDrawer}
        />
      )}

      {/* DRAWER */}
      <Animated.View
        style={[styles.drawer, { transform: [{ translateX: drawerAnim }] }]}
      >
        {/* Drawer header */}
        <View style={styles.drawerHeader}>
          <Text style={styles.drawerLogo}>🔮</Text>
          <Text style={styles.drawerBrand}>Tarot Flow</Text>
        </View>

        {/* New chat button */}
        <TouchableOpacity style={styles.newChatBtn} onPress={startNewSession}>
          <Text style={styles.newChatIcon}>+</Text>
          <Text style={styles.newChatText}>Yeni Sohbet</Text>
        </TouchableOpacity>

        {/* Session list */}
        <View style={styles.sessionListContainer}>
          <FlatList
            data={sessions}
            keyExtractor={(item) => item.id}
            renderItem={() => null}
            ListHeaderComponent={
              <>
                {renderSessionGroup('Bugün', today)}
                {renderSessionGroup('Bu Hafta', week)}
                {renderSessionGroup('Daha Eski', older)}
                {sessions.length === 0 && (
                  <Text style={styles.emptyText}>Henüz sohbet yok</Text>
                )}
              </>
            }
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Drawer footer */}
        <View style={styles.drawerFooter}>
          <View style={styles.userInfo}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>
                {user?.email?.charAt(0).toUpperCase() || '?'}
              </Text>
            </View>
            <Text style={styles.userEmail} numberOfLines={1}>
              {user?.email || 'Anonim'}
            </Text>
          </View>
          <TouchableOpacity onPress={signOut}>
            <Text style={styles.logoutText}>Çıkış</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* MAIN CONTENT */}
      <KeyboardAvoidingView
        style={styles.main}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={openDrawer} style={styles.menuBtn}>
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {currentSession?.title || '🔮 Tarot Flow'}
            </Text>
          </View>
          {currentSession?.status === 'active' && messages.length > 0 && (
            <TouchableOpacity onPress={handleEndSession} style={styles.endBtn} disabled={loading}>
              <Text style={styles.endBtnText}>Bitir</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Welcome */}
        {messages.length === 0 && !loading && (
          <View style={styles.welcome}>
            <Text style={styles.welcomeEmoji}>🌙</Text>
            <Text style={styles.welcomeTitle}>Hoş geldin</Text>
            <Text style={styles.welcomeText}>
              Bir soru sor veya niyetini belirt.{'\n'}
              Kartlar senin için açılacak.
            </Text>
            <View style={styles.suggestions}>
              {['İş hayatım hakkında', 'Aşk hayatım hakkında', 'Genel bir okuma'].map((s) => (
                <TouchableOpacity
                  key={s}
                  style={styles.suggestionChip}
                  onPress={() => setInputText(s)}
                >
                  <Text style={styles.suggestionText}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          style={styles.messageList}
          contentContainerStyle={[
            styles.messageListContent,
            messages.length === 0 && { flex: 1 },
          ]}
          onContentSizeChange={scrollToBottom}
          keyboardShouldPersistTaps="handled"
        />

        {/* Loading */}
        {loading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="#9B8AFF" />
            <Text style={styles.loadingText}>Kartlar okunuyor...</Text>
          </View>
        )}

        {/* Retry Button */}
        {retryPayload && !loading && currentSession?.status === 'active' && (
          <View style={styles.retryRow}>
            <Text style={styles.retryText}>Bağlantı kurulamadı.</Text>
            <TouchableOpacity 
              style={styles.retryButton} 
              onPress={() => fetchReading(retryPayload.question, retryPayload.history)}
            >
              <Text style={styles.retryButtonText}>Tekrar Dene</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Input */}
        {currentSession?.status === 'active' && (
          <View style={styles.inputBar}>
            <TextInput
              style={styles.input}
              placeholder="Niyetini belirt veya soru sor..."
              placeholderTextColor="#5A5A7A"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              editable={!loading}
              onFocus={scrollToBottom}
            />
            <TouchableOpacity
              style={[styles.sendBtn, (!inputText.trim() || loading) && styles.sendBtnOff]}
              onPress={sendMessage}
              disabled={!inputText.trim() || loading}
            >
              <Text style={styles.sendIcon}>↑</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Read-only notice for completed sessions */}
        {currentSession?.status === 'completed' && (
          <View style={styles.readOnlyBar}>
            <Text style={styles.readOnlyText}>
              Bu oturum tamamlanmış. Yeni sohbet başlatmak için ☰ menüye git.
            </Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A16' },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 10,
  },

  // DRAWER
  drawer: {
    position: 'absolute', top: 0, bottom: 0, left: 0,
    width: DRAWER_WIDTH, backgroundColor: '#0D0D20',
    zIndex: 20, paddingTop: Platform.OS === 'ios' ? 60 : 40,
    borderRightWidth: 1, borderRightColor: 'rgba(124, 92, 252, 0.1)',
  },
  drawerHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingBottom: 24, gap: 10,
  },
  drawerLogo: { fontSize: 26 },
  drawerBrand: {
    fontSize: 22, fontWeight: '800', color: '#F5F5F5',
    letterSpacing: 1,
  },

  newChatBtn: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 12, paddingVertical: 13, paddingHorizontal: 16,
    borderRadius: 12, gap: 10, marginBottom: 8,
    backgroundColor: 'rgba(124, 92, 252, 0.08)',
    borderWidth: 1, borderColor: 'rgba(124, 92, 252, 0.2)',
  },
  newChatIcon: { fontSize: 20, color: '#9B8AFF', fontWeight: '300' },
  newChatText: { fontSize: 14, color: '#C8BFFF', fontWeight: '600' },

  sessionListContainer: { flex: 1 },
  groupTitle: {
    color: '#5A5A7A', fontSize: 10, fontWeight: '700',
    paddingHorizontal: 20, paddingTop: 18, paddingBottom: 6,
    textTransform: 'uppercase', letterSpacing: 1.5,
  },
  sessionItem: {
    paddingHorizontal: 12, paddingVertical: 11, marginHorizontal: 8,
    borderRadius: 10,
  },
  sessionItemActive: {
    backgroundColor: 'rgba(124, 92, 252, 0.1)',
    borderWidth: 1, borderColor: 'rgba(124, 92, 252, 0.15)',
  },
  sessionItemRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sessionItemIcon: { fontSize: 16 },
  sessionItemTextWrap: { flex: 1 },
  sessionItemTitle: { color: '#D8D0E8', fontSize: 14, fontWeight: '500' },
  sessionItemMeta: { color: '#5A5A7A', fontSize: 11, marginTop: 2 },
  deleteButton: {
    width: 24, height: 24, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  deleteIcon: { color: '#5A5A7A', fontSize: 12 },
  emptyText: { color: '#5A5A7A', textAlign: 'center', paddingVertical: 24, fontSize: 14 },

  drawerFooter: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 16,
    borderTopWidth: 1, borderTopColor: 'rgba(124, 92, 252, 0.08)',
  },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  userAvatar: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: 'rgba(124, 92, 252, 0.2)',
    borderWidth: 1, borderColor: 'rgba(124, 92, 252, 0.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  userAvatarText: { color: '#C8BFFF', fontSize: 14, fontWeight: '700' },
  userEmail: { color: '#7A7A9D', fontSize: 13, flex: 1 },
  logoutText: { color: '#FF6B6B', fontSize: 13, fontWeight: '500' },

  // MAIN
  main: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: 'rgba(124, 92, 252, 0.06)',
    gap: 12,
    backgroundColor: 'rgba(10, 10, 22, 0.9)',
  },
  menuBtn: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(124, 92, 252, 0.08)',
    borderWidth: 1, borderColor: 'rgba(124, 92, 252, 0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  menuIcon: { fontSize: 18, color: '#C8BFFF' },
  headerCenter: { flex: 1 },
  headerTitle: {
    fontSize: 17, fontWeight: '700', color: '#F5F5F5',
    letterSpacing: 0.3,
  },
  endBtn: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10,
    borderWidth: 1, borderColor: 'rgba(255, 107, 107, 0.25)',
    backgroundColor: 'rgba(255, 107, 107, 0.06)',
  },
  endBtnText: { color: '#FF8A8A', fontSize: 13, fontWeight: '600' },

  // WELCOME
  welcome: {
    position: 'absolute', top: 60, left: 0, right: 0, bottom: 60,
    justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 36, zIndex: -1,
  },
  welcomeEmoji: { fontSize: 64, marginBottom: 16 },
  welcomeTitle: {
    fontSize: 26, fontWeight: '800', color: '#F5F5F5',
    marginBottom: 10, letterSpacing: 1,
  },
  welcomeText: {
    fontSize: 15, color: '#7A7A9D', textAlign: 'center', lineHeight: 24,
  },
  suggestions: {
    flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'center', gap: 10, marginTop: 28,
  },
  suggestionChip: {
    paddingHorizontal: 18, paddingVertical: 12,
    borderRadius: 24, borderWidth: 1,
    borderColor: 'rgba(124, 92, 252, 0.2)',
    backgroundColor: 'rgba(124, 92, 252, 0.06)',
  },
  suggestionText: { color: '#B8AEFF', fontSize: 13, fontWeight: '500' },

  // MESSAGES
  messageList: { flex: 1 },
  messageListContent: { paddingVertical: 14 },

  loadingRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, gap: 10,
  },
  loadingText: { color: '#9B8AFF', fontSize: 13, fontWeight: '500', fontStyle: 'italic' },

  retryRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, gap: 12,
  },
  retryText: { color: '#FF8A8A', fontSize: 13 },
  retryButton: {
    paddingHorizontal: 18, paddingVertical: 9,
    backgroundColor: 'rgba(255, 107, 107, 0.1)', borderRadius: 20,
    borderWidth: 1, borderColor: 'rgba(255, 107, 107, 0.25)',
  },
  retryButtonText: { color: '#FF8A8A', fontSize: 13, fontWeight: '600' },

  // INPUT
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: 12, paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: 'rgba(124, 92, 252, 0.06)',
    gap: 10,
    backgroundColor: 'rgba(10, 10, 22, 0.95)',
  },
  input: {
    flex: 1, borderRadius: 22,
    paddingHorizontal: 18, paddingTop: 12, paddingBottom: 12,
    fontSize: 15, color: '#E8E0F0', maxHeight: 100, minHeight: 46,
    backgroundColor: 'rgba(20, 18, 40, 0.8)',
    borderWidth: 1, borderColor: 'rgba(124, 92, 252, 0.12)',
  },
  sendBtn: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: '#7C5CFC', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#7C5CFC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  sendBtnOff: {
    backgroundColor: 'rgba(42, 38, 60, 0.8)',
    shadowOpacity: 0,
    elevation: 0,
  },
  sendIcon: { color: '#FFF', fontSize: 22, fontWeight: '700' },

  // READ-ONLY
  readOnlyBar: {
    paddingHorizontal: 16, paddingVertical: 16,
    borderTopWidth: 1, borderTopColor: 'rgba(124, 92, 252, 0.06)',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 10, 22, 0.95)',
  },
  readOnlyText: { color: '#5A5A7A', fontSize: 13, textAlign: 'center' },
});

