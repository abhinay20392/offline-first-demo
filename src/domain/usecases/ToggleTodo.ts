import { Todo } from '../entities/Todo';
import { TodoRepository } from '../repositories/TodoRepository';

export const toggleTodo = async (
  repository: TodoRepository,
  id: string,
): Promise<Todo[]> => {
  return repository.toggleTodo(id);
};
