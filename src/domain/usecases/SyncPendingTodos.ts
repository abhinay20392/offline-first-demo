import { Todo } from '../entities/Todo';
import { TodoRepository } from '../repositories/TodoRepository';

export const syncPendingTodos = async (
  repository: TodoRepository,
): Promise<Todo[]> => {
  return repository.syncPending();
};
