import React, { useState } from 'react';
import {
  FlatList,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTodoViewModel } from './src/presentation/hooks/useTodoViewModel';

function App() {
  const {
    todos,
    isOnline,
    isSyncing,
    pendingCount,
    createTodo,
    onUpdateTodo,
    onDeleteTodo,
    onToggleTodo,
    onSyncNow,
  } = useTodoViewModel();
  const [draft, setDraft] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingDraft, setEditingDraft] = useState('');

  const statusLabel = isOnline ? 'ONLINE' : 'OFFLINE';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <Text style={styles.title}>Offline-first Todos</Text>
        <Text style={styles.subtitle}>
          Changes are saved locally first and synced when online.
        </Text>

        {isSyncing ? (
          <View style={styles.syncBanner}>
            <Text style={styles.syncBannerText}>
              Syncing data... Please keep internet on.
            </Text>
          </View>
        ) : null}

        <View style={styles.badgeRow}>
          <View
            style={[
              styles.badge,
              isOnline ? styles.badgeOnline : styles.badgeOffline,
            ]}>
            <Text style={styles.badgeText}>{statusLabel}</Text>
          </View>
          <Text style={styles.pendingText}>Pending sync: {pendingCount}</Text>
        </View>

        <View style={styles.actionRow}>
          <Pressable style={styles.secondaryButton} onPress={onSyncNow}>
            <Text style={styles.secondaryButtonText}>
              {isSyncing ? 'Syncing...' : 'Sync now'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={draft}
            onChangeText={setDraft}
            placeholder="Add todo item"
            placeholderTextColor="#7d8592"
          />
          <Pressable
            style={styles.primaryButton}
            onPress={async () => {
              await createTodo(draft);
              setDraft('');
            }}>
            <Text style={styles.primaryButtonText}>Add</Text>
          </Pressable>
        </View>

        <FlatList
          data={todos}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No todos yet. Add one above.</Text>
          }
          renderItem={({ item }) => {
            const isEditing = editingId === item.id;
            return (
              <View style={styles.todoCard}>
                {isEditing ? (
                  <TextInput
                    style={styles.editInput}
                    value={editingDraft}
                    onChangeText={setEditingDraft}
                    autoFocus
                  />
                ) : (
                  <Pressable onPress={() => onToggleTodo(item.id)}>
                    <Text
                      style={[
                        styles.todoTitle,
                        item.completed ? styles.todoCompleted : undefined,
                      ]}>
                      {item.title}
                    </Text>
                  </Pressable>
                )}
                <Text style={styles.todoMeta}>
                  {item.completed ? 'Done' : 'Open'} • {item.syncState}
                </Text>

                <View style={styles.todoActions}>
                  {isEditing ? (
                    <>
                      <Pressable
                        style={styles.smallButton}
                        onPress={async () => {
                          await onUpdateTodo(item.id, editingDraft);
                          setEditingId(null);
                          setEditingDraft('');
                        }}>
                        <Text style={styles.smallButtonText}>Save</Text>
                      </Pressable>
                      <Pressable
                        style={styles.smallButton}
                        onPress={() => {
                          setEditingId(null);
                          setEditingDraft('');
                        }}>
                        <Text style={styles.smallButtonText}>Cancel</Text>
                      </Pressable>
                    </>
                  ) : (
                    <>
                      <Pressable
                        style={styles.smallButton}
                        onPress={() => {
                          setEditingId(item.id);
                          setEditingDraft(item.title);
                        }}>
                        <Text style={styles.smallButtonText}>Edit</Text>
                      </Pressable>
                      <Pressable
                        style={[styles.smallButton, styles.deleteButton]}
                        onPress={() => onDeleteTodo(item.id)}>
                        <Text
                          style={[styles.smallButtonText, styles.deleteButtonText]}>
                          Delete
                        </Text>
                      </Pressable>
                    </>
                  )}
                </View>
              </View>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f7fb',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    marginTop: 6,
    color: '#4b5563',
    fontSize: 14,
  },
  syncBanner: {
    marginTop: 12,
    backgroundColor: '#fff7ed',
    borderColor: '#fdba74',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  syncBannerText: {
    color: '#9a3412',
    fontWeight: '600',
    fontSize: 13,
  },
  badgeRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeOnline: {
    backgroundColor: '#15803d',
  },
  badgeOffline: {
    backgroundColor: '#b91c1c',
  },
  badgeText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 12,
  },
  pendingText: {
    color: '#374151',
    fontSize: 13,
  },
  actionRow: {
    marginTop: 14,
    gap: 10,
    flexDirection: 'row',
  },
  secondaryButton: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  secondaryButtonText: {
    color: '#111827',
    fontWeight: '600',
  },
  inputRow: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    color: '#111827',
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  list: {
    paddingTop: 16,
    paddingBottom: 40,
    gap: 10,
  },
  todoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  todoTitle: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
  },
  todoCompleted: {
    textDecorationLine: 'line-through',
    color: '#6b7280',
  },
  todoMeta: {
    marginTop: 6,
    color: '#6b7280',
    textTransform: 'capitalize',
    fontSize: 12,
  },
  todoActions: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 8,
  },
  smallButton: {
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  smallButtonText: {
    color: '#111827',
    fontWeight: '600',
    fontSize: 12,
  },
  deleteButton: {
    backgroundColor: '#fee2e2',
  },
  deleteButtonText: {
    color: '#991b1b',
  },
  editInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#111827',
    fontSize: 15,
  },
  emptyText: {
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 18,
  },
});

export default App;
