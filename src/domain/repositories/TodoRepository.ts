import { Todo } from '../entities/Todo';

export interface TodoRepository {
  getTodos(): Promise<Todo[]>;
  addTodo(title: string): Promise<Todo[]>;
  updateTodo(id: string, title: string): Promise<Todo[]>;
  deleteTodo(id: string): Promise<Todo[]>;
  toggleTodo(id: string): Promise<Todo[]>;
  syncPending(): Promise<Todo[]>;
  setOnline(isOnline: boolean): Promise<void>;
  getOnlineState(): Promise<boolean>;
}
