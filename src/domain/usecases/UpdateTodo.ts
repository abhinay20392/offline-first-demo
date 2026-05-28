import { Todo } from '../entities/Todo';
import { TodoRepository } from '../repositories/TodoRepository';

export const updateTodo = async (
  repository: TodoRepository,
  id: string,
  title: string,
): Promise<Todo[]> => {
  return repository.updateTodo(id, title);
};
