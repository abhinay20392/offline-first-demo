import AsyncStorage from '@react-native-async-storage/async-storage';
import { Todo } from '../../domain/entities/Todo';

const TODOS_KEY = '@offline_first_demo/todos';
const ONLINE_KEY = '@offline_first_demo/online';

export class TodoLocalDataSource {
  async readTodos(): Promise<Todo[]> {
    const rawValue = await AsyncStorage.getItem(TODOS_KEY);
    if (!rawValue) {
      return [];
    }

    try {
      return JSON.parse(rawValue) as Todo[];
    } catch {
      return [];
    }
  }

  async saveTodos(todos: Todo[]): Promise<void> {
    await AsyncStorage.setItem(TODOS_KEY, JSON.stringify(todos));
  }

  async setOnlineState(isOnline: boolean): Promise<void> {
    await AsyncStorage.setItem(ONLINE_KEY, isOnline ? '1' : '0');
  }

  async getOnlineState(): Promise<boolean> {
    const value = await AsyncStorage.getItem(ONLINE_KEY);
    if (value === null) {
      return true;
    }
    return value === '1';
  }
}
