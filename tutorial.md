# Build an Offline-First React Native App with Clean Architecture (Complete CRUD + MockAPI)

If you want your app to keep working when internet is unstable, this tutorial is for you.

In this guide, we build an **offline-first Todo app** in React Native with:

- full CRUD (create, read, update, delete)
- automatic online/offline detection from device network
- sync indicator while data is syncing
- MockAPI integration for demo backend sync
- clean architecture structure that is easy to scale

---

## What "offline-first" means here

Offline-first means:

1. User actions update local data immediately.
2. The app UI reflects those local changes instantly.
3. If internet is unavailable, changed items are marked `pending`.
4. When internet comes back, pending items are synced to server.
5. Once synced, items are marked `synced`.

This gives users a smooth experience even with poor network quality.

---

## Project structure

```text
App.tsx
src/
  data/
    local/TodoLocalDataSource.ts
    remote/TodoRemoteDataSource.ts
    repositories/TodoRepositoryImpl.ts
  di/
    container.ts
  domain/
    entities/Todo.ts
    repositories/TodoRepository.ts
    usecases/
      AddTodo.ts
      GetTodos.ts
      UpdateTodo.ts
      DeleteTodo.ts
      ToggleTodo.ts
      SyncPendingTodos.ts
  presentation/
    hooks/useTodoViewModel.ts
__tests__/
  App.test.tsx
```

How to read this:

- **domain** = business rules
- **data** = storage and API implementation
- **presentation** = UI state and interaction logic
- **di** = dependency wiring

---

## Step 1: Domain layer (business model and contracts)

### `src/domain/entities/Todo.ts`

Defines the app's core entity:

- `id`: local unique identifier
- `title`: todo text
- `completed`: done/not done
- `updatedAt`: timestamp used during sync/update
- `syncState`: `'synced' | 'pending'`

Why this matters:

- The domain model is framework-agnostic.
- Every layer uses this shape, keeping data consistent.

### `src/domain/repositories/TodoRepository.ts`

Defines what the app can do with todos, independent of implementation:

- `getTodos()`
- `addTodo(title)`
- `updateTodo(id, title)`
- `deleteTodo(id)`
- `toggleTodo(id)`
- `syncPending()`
- `setOnline(isOnline)`
- `getOnlineState()`

Why this matters:

- UI/usecases depend on this contract, not concrete classes.
- You can swap local storage or backend provider without changing UI logic.

### `src/domain/usecases/*`

Each file wraps one business action:

- `GetTodos.ts`
- `AddTodo.ts`
- `UpdateTodo.ts`
- `DeleteTodo.ts`
- `ToggleTodo.ts`
- `SyncPendingTodos.ts`

Why this matters:

- Keeps each operation focused and testable.
- Makes future validation/business rules easy to add per action.

---

## Step 2: Data layer (local + remote)

### `src/data/local/TodoLocalDataSource.ts`

Handles device persistence using AsyncStorage:

- `readTodos()` reads todos from `@offline_first_demo/todos`
- `saveTodos(todos)` stores todos
- `setOnlineState(isOnline)` and `getOnlineState()` persist online status flag

Why this matters:

- Local storage is the source of truth for fast UX.
- App restarts do not lose offline changes.

### `src/data/remote/TodoRemoteDataSource.ts`

Handles server sync with MockAPI.

Key parts:

- `MOCK_API_BASE_URL`: configure your project URL
- fallback simulated sync if base URL is empty
- `syncTodos(todos)` does:
  - fetch remote todos
  - delete remote items not present locally
  - update matched records by `localId`
  - create new records for missing items
  - return local todos marked as `synced`

Why `localId`?

- MockAPI has its own `id`.
- Your app uses local ids.
- `localId` bridges local and remote records safely.

### `src/data/repositories/TodoRepositoryImpl.ts`

Implements `TodoRepository` by coordinating local + remote sources.

Offline-first behavior here:

- CRUD operations always update local storage first.
- For update/toggle:
  - online -> mark item `synced`
  - offline -> mark item `pending`
- `syncPending()` calls remote sync only when:
  - app is online, and
  - at least one todo is pending

Why this matters:

- This is the core policy layer for consistency between local and remote.

---

## Step 3: Dependency injection

### `src/di/container.ts`

Creates and wires concrete dependencies:

- `TodoLocalDataSource`
- `TodoRemoteDataSource`
- `TodoRepositoryImpl`

Exports `todoRepository` used by the view model.

Why this matters:

- Centralized wiring avoids scattered `new` calls.
- Easier to replace dependencies in tests.

---

## Step 4: Presentation logic

### `src/presentation/hooks/useTodoViewModel.ts`

This hook is your presentation orchestrator.

It manages:

- UI state: `todos`, `isOnline`, `isSyncing`, `pendingCount`
- network detection via `@react-native-community/netinfo`
- CRUD action handlers for UI
- automatic sync when connectivity comes back

Important behavior:

- On startup (`bootstrap`):
  - load local todos
  - detect current network state
  - set online state and sync if needed
- On network change:
  - update online state
  - auto-sync when back online
- `onSyncNow`:
  - manual sync trigger (only when online)
- sync lock:
  - `isSyncingRef` prevents parallel sync calls

Why this matters:

- UI components stay simple.
- All async/network/business orchestration stays in one place.

---

## Step 5: UI layer

### `App.tsx`

Renders complete CRUD interface:

- Add todo input + button
- Todo list
- Tap title to toggle complete
- Inline edit mode with Save/Cancel
- Delete button
- Online/offline status badge
- Pending sync count
- "Sync now" button
- Syncing notification banner

Why this matters:

- UI reflects current sync/network state clearly.
- Users understand when data is pending and when it is syncing.

---

## Step 6: Testing

### `__tests__/App.test.tsx`

Basic render test with dependency mocks:

- AsyncStorage mock
- NetInfo mock

Why this matters:

- Prevents test failures due to native modules.
- Keeps base test stable as UI evolves.

---

## Configure MockAPI (required for real remote sync)

1. Create a free account at [MockAPI](https://mockapi.io/).
2. Create a project.
3. Create a `todos` resource.
4. Open `src/data/remote/TodoRemoteDataSource.ts`.
5. Set:

```ts
const MOCK_API_BASE_URL = 'https://your-project.mockapi.io/api/v1';
```

Example resource fields used by this app:

- `localId` (string)
- `title` (string)
- `completed` (boolean)
- `updatedAt` (number)

---

## End-to-end data flow

When user creates/updates/deletes/toggles:

1. UI calls view-model handler.
2. Handler calls usecase.
3. Usecase calls repository contract.
4. Repository implementation writes local data immediately.
5. Item sync state is marked based on connectivity.
6. If online, sync can run and push data to MockAPI.
7. UI updates from local source and reflects current sync state.

---

## Why this architecture is production-friendly

- Clear separation of concerns
- Replaceable backend/provider
- Easy to unit test usecases/repository
- Offline resilience by default
- Scales better than putting all logic directly in components

---

## Common improvements you can add next

- Conflict resolution strategy (server wins/client wins/version-based)
- Background sync queue with retries/backoff
- Pull-to-refresh from server
- Pagination/search/filter
- Authentication and per-user data partitioning
- Better error toasts for sync failures

---

## Medium publishing tips

If you plan to publish this on Medium:

- Keep this `tutorial.md` as the full article draft.
- Add 2 screenshots:
  - offline mode with pending count
  - syncing banner when internet returns
- Add one architecture diagram using the folder structure above.
- End with a GitHub link and "what to build next".

---

## Quick run commands

```sh
yarn install
yarn start
yarn android
# or
yarn ios
yarn test
```

You now have a complete offline-first React Native CRUD app with clean architecture and MockAPI sync.
