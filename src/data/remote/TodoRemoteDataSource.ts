import { Todo } from '../../domain/entities/Todo';

const networkDelay = (ms: number) =>
  new Promise(resolve => {
    setTimeout(resolve, ms);
  });

// Add your MockAPI base URL here: https://<project>.mockapi.io/api/v1
const MOCK_API_BASE_URL = '';

type RemoteTodo = {
  id: string;
  localId: string;
  title: string;
  completed: boolean;
  updatedAt: number;
};

const ensureOk = async (response: Response, action: string) => {
  if (!response.ok) {
    throw new Error(`MockAPI ${action} failed: ${response.status}`);
  }
};

export class TodoRemoteDataSource {
  async syncTodos(todos: Todo[]): Promise<Todo[]> {
    if (!MOCK_API_BASE_URL) {
      await networkDelay(700);
      return todos.map(todo => ({
        ...todo,
        syncState: 'synced',
        updatedAt: Date.now(),
      }));
    }

    const endpoint = `${MOCK_API_BASE_URL.replace(/\/$/, '')}/todos`;
    const remoteResponse = await fetch(endpoint);
    await ensureOk(remoteResponse, 'fetch');

    const remoteTodos = (await remoteResponse.json()) as RemoteTodo[];
    const remoteByLocalId = new Map(
      remoteTodos.map(remoteTodo => [remoteTodo.localId, remoteTodo]),
    );
    const localIds = new Set(todos.map(todo => todo.id));

    // Delete remote records that no longer exist locally.
    await Promise.all(
      remoteTodos
        .filter(remoteTodo => !localIds.has(remoteTodo.localId))
        .map(async remoteTodo => {
          const response = await fetch(`${endpoint}/${remoteTodo.id}`, {
            method: 'DELETE',
          });
          await ensureOk(response, 'delete');
        }),
    );

    await Promise.all(
      todos.map(async todo => {
        const payload = {
          localId: todo.id,
          title: todo.title,
          completed: todo.completed,
          updatedAt: todo.updatedAt,
        };

        const matchedRemote = remoteByLocalId.get(todo.id);
        if (matchedRemote) {
          const response = await fetch(`${endpoint}/${matchedRemote.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });
          await ensureOk(response, 'update');
          return;
        }

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        await ensureOk(response, 'create');
      }),
    );

    return todos.map(todo => ({
      ...todo,
      syncState: 'synced',
      updatedAt: Date.now(),
    }));
  }
}
