# Offline-First React Native Demo (Clean Architecture)

This project is a minimal tutorial app that demonstrates:

- offline-first state updates
- local persistence first, sync later
- clean architecture layering in React Native + TypeScript
- complete CRUD for todos (create, read, update, delete)

The sample app is a Todo list where changes are always written locally first.
When the app is online, pending changes are synchronized and marked as synced.
Online/offline status is detected from the device network state.

## Architecture

The project follows a simple clean architecture split:

- `src/domain`
  - `entities`: core business models (`Todo`)
  - `repositories`: abstract contracts (`TodoRepository`)
  - `usecases`: application actions (`addTodo`, `updateTodo`, `deleteTodo`, `toggleTodo`, `syncPendingTodos`)
- `src/data`
  - `local`: AsyncStorage persistence
  - `remote`: MockAPI-based sync
  - `repositories`: concrete repository implementation
- `src/presentation`
  - hooks/view-model logic consumed by UI (`useTodoViewModel`)
- `src/di`
  - dependency wiring (`container.ts`)

## How offline-first works in this demo

1. Every user action updates local storage immediately.
2. If online, new/updated todo items are marked `synced`.
3. If offline, they are marked `pending`.
4. On reconnect (or manual sync), pending items are sent to remote and then marked `synced`.
5. While sync is running, an in-app notification banner is shown.

## Quick Start

### 1) Install dependencies

```sh
yarn install
```

### 2) Start Metro

```sh
yarn start
```

### 3) Run app

```sh
# Android
yarn android

# iOS
yarn ios
```

For iOS first-time setup:

```sh
bundle install
bundle exec pod install
```

## Demo steps

1. Start in online mode.
2. Add a few todos.
3. Turn off mobile data/Wi-Fi on your device or emulator.
4. Add/toggle todos while offline.
5. Observe `Pending sync` count increase.
6. Turn internet back on.
7. Watch the **Syncing data...** notification banner.
8. Verify pending items become synced.

## Configure MockAPI

1. Create a free project at [MockAPI](https://mockapi.io/).
2. Create a resource named `todos`.
3. Open `src/data/remote/TodoRemoteDataSource.ts`.
4. Set `MOCK_API_BASE_URL` to your project base URL, for example:

```ts
const MOCK_API_BASE_URL = 'https://your-project.mockapi.io/api/v1';
```

After this, sync uses real MockAPI `GET/POST/PUT/DELETE` calls.

## Tutorial: Extend this architecture

You can evolve this into production architecture by:

- introducing retry/backoff and conflict resolution
- adding timestamp/version based merge strategies
- adding network detection (`@react-native-community/netinfo`)
- splitting UI into reusable components and navigation flows

## Test

```sh
yarn test
```

## Notes

- `AsyncStorage` is used for local persistence.
- If `MOCK_API_BASE_URL` is empty, the app falls back to simulated sync.
