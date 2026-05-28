import { TodoLocalDataSource } from '../data/local/TodoLocalDataSource';
import { TodoRemoteDataSource } from '../data/remote/TodoRemoteDataSource';
import { TodoRepositoryImpl } from '../data/repositories/TodoRepositoryImpl';

const localDataSource = new TodoLocalDataSource();
const remoteDataSource = new TodoRemoteDataSource();

export const todoRepository = new TodoRepositoryImpl(
  localDataSource,
  remoteDataSource,
);
