export type SyncState = 'synced' | 'pending';

export type Todo = {
  id: string;
  title: string;
  completed: boolean;
  updatedAt: number;
  syncState: SyncState;
};
