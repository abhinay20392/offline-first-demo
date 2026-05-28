import { Todo } from '../entities/Todo';
import { TodoRepository } from '../repositories/TodoRepository';

export const getTodos = async (repository: TodoRepository): Promise<Todo[]> => {
  return repository.getTodos();
};
