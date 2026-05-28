import { Todo } from '../../domain/entities/Todo';
import { TodoRepository } from '../../domain/repositories/TodoRepository';
import { TodoLocalDataSource } from '../local/TodoLocalDataSource';
import { TodoRemoteDataSource } from '../remote/TodoRemoteDataSource';

const createTodo = (title: string, syncState: Todo['syncState']): Todo => {
  const now = Date.now();
  return {
    id: `${now}-${Math.random().toString(16).slice(2)}`,
    title,
    completed: false,
    updatedAt: now,
    syncState,
  };
};

export class TodoRepositoryImpl implements TodoRepository {
  constructor(
    private readonly localDataSource: TodoLocalDataSource,
    private readonly remoteDataSource: TodoRemoteDataSource,
  ) {}

  async getTodos(): Promise<Todo[]> {
    return this.localDataSource.readTodos();
  }

  async addTodo(title: string): Promise<Todo[]> {
    const isOnline = await this.localDataSource.getOnlineState();
    const todos = await this.localDataSource.readTodos();
    const nextTodo = createTodo(title, isOnline ? 'synced' : 'pending');
    const nextTodos = [nextTodo, ...todos];

    await this.localDataSource.saveTodos(nextTodos);
    return nextTodos;
  }

  async updateTodo(id: string, title: string): Promise<Todo[]> {
    const isOnline = await this.localDataSource.getOnlineState();
    const todos = await this.localDataSource.readTodos();
    const nextTodos = todos.map(todo =>
      todo.id === id
        ? {
            ...todo,
            title,
            updatedAt: Date.now(),
            syncState: isOnline ? 'synced' : 'pending',
          }
        : todo,
    );

    await this.localDataSource.saveTodos(nextTodos);
    return nextTodos;
  }

  async deleteTodo(id: string): Promise<Todo[]> {
    const todos = await this.localDataSource.readTodos();
    const nextTodos = todos.filter(todo => todo.id !== id);
    await this.localDataSource.saveTodos(nextTodos);
    return nextTodos;
  }

  async toggleTodo(id: string): Promise<Todo[]> {
    const isOnline = await this.localDataSource.getOnlineState();
    const todos = await this.localDataSource.readTodos();
    const nextTodos = todos.map(todo =>
      todo.id === id
        ? {
            ...todo,
            completed: !todo.completed,
            updatedAt: Date.now(),
            syncState: isOnline ? 'synced' : 'pending',
          }
        : todo,
    );

    await this.localDataSource.saveTodos(nextTodos);
    return nextTodos;
  }

  async syncPending(): Promise<Todo[]> {
    const isOnline = await this.localDataSource.getOnlineState();
    const todos = await this.localDataSource.readTodos();
    const hasPending = todos.some(todo => todo.syncState === 'pending');

    if (!isOnline || !hasPending) {
      return todos;
    }

    const syncedTodos = await this.remoteDataSource.syncTodos(todos);
    await this.localDataSource.saveTodos(syncedTodos);
    return syncedTodos;
  }

  async setOnline(isOnline: boolean): Promise<void> {
    await this.localDataSource.setOnlineState(isOnline);
  }

  async getOnlineState(): Promise<boolean> {
    return this.localDataSource.getOnlineState();
  }
}
