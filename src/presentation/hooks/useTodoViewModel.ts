import NetInfo from '@react-native-community/netinfo';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Todo } from '../../domain/entities/Todo';
import { addTodo } from '../../domain/usecases/AddTodo';
import { deleteTodo } from '../../domain/usecases/DeleteTodo';
import { getTodos } from '../../domain/usecases/GetTodos';
import { syncPendingTodos } from '../../domain/usecases/SyncPendingTodos';
import { toggleTodo } from '../../domain/usecases/ToggleTodo';
import { updateTodo } from '../../domain/usecases/UpdateTodo';
import { todoRepository } from '../../di/container';

type UseTodoViewModelResult = {
  todos: Todo[];
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  createTodo: (title: string) => Promise<void>;
  onUpdateTodo: (id: string, title: string) => Promise<void>;
  onDeleteTodo: (id: string) => Promise<void>;
  onToggleTodo: (id: string) => Promise<void>;
  onSyncNow: () => Promise<void>;
};

export const useTodoViewModel = (): UseTodoViewModelResult => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const isSyncingRef = useRef(false);
  const isOnlineRef = useRef(true);

  const pendingCount = useMemo(
    () => todos.filter(todo => todo.syncState === 'pending').length,
    [todos],
  );

  const syncIfNeeded = useCallback(async () => {
    if (!isOnlineRef.current || isSyncingRef.current) {
      return;
    }

    isSyncingRef.current = true;
    setIsSyncing(true);
    try {
      const syncedTodos = await syncPendingTodos(todoRepository);
      setTodos(syncedTodos);
    } finally {
      isSyncingRef.current = false;
      setIsSyncing(false);
    }
  }, []);

  const updateOnlineState = useCallback(
    async (nextOnlineState: boolean) => {
      isOnlineRef.current = nextOnlineState;
      setIsOnline(nextOnlineState);
      await todoRepository.setOnline(nextOnlineState);
      if (nextOnlineState) {
        await syncIfNeeded();
      }
    },
    [syncIfNeeded],
  );

  const bootstrap = useCallback(async () => {
    const storedTodos = await getTodos(todoRepository);
    setTodos(storedTodos);
    const state = await NetInfo.fetch();
    const onlineState = Boolean(state.isConnected && state.isInternetReachable);
    await updateOnlineState(onlineState);
  }, [updateOnlineState]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(async state => {
      const onlineState = Boolean(state.isConnected && state.isInternetReachable);
      await updateOnlineState(onlineState);
    });
    return unsubscribe;
  }, [updateOnlineState]);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const createTodo = useCallback(
    async (title: string) => {
      const trimmedTitle = title.trim();
      if (!trimmedTitle) {
        return;
      }
      const nextTodos = await addTodo(todoRepository, trimmedTitle);
      setTodos(nextTodos);
    },
    [setTodos],
  );

  const onToggleTodo = useCallback(async (id: string) => {
    const nextTodos = await toggleTodo(todoRepository, id);
    setTodos(nextTodos);
  }, []);

  const onUpdateTodo = useCallback(async (id: string, title: string) => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      return;
    }

    const nextTodos = await updateTodo(todoRepository, id, trimmedTitle);
    setTodos(nextTodos);
  }, []);

  const onDeleteTodo = useCallback(async (id: string) => {
    const nextTodos = await deleteTodo(todoRepository, id);
    setTodos(nextTodos);
  }, []);

  const onSyncNow = useCallback(async () => {
    if (!isOnline) {
      return;
    }
    await syncIfNeeded();
  }, [isOnline, syncIfNeeded]);

  return {
    todos,
    isOnline,
    isSyncing,
    pendingCount,
    createTodo,
    onUpdateTodo,
    onDeleteTodo,
    onToggleTodo,
    onSyncNow,
  };
};
