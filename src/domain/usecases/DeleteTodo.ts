import { Todo } from '../entities/Todo';
import { TodoRepository } from '../repositories/TodoRepository';

export const deleteTodo = async (
  repository: TodoRepository,
  id: string,
): Promise<Todo[]> => {
  return repository.deleteTodo(id);
};
