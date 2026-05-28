import { Todo } from '../entities/Todo';
import { TodoRepository } from '../repositories/TodoRepository';

export const addTodo = async (
  repository: TodoRepository,
  title: string,
): Promise<Todo[]> => {
  return repository.addTodo(title);
};
