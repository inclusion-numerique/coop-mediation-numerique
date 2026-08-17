/**
 * Compteurs d'une passe de synchronisation, dans la forme qu'attend encore
 * `installWebhooks`. La dérive, elle, se calcule dans le domaine — voir
 * `domain/bilan-synchronisation`.
 */
export type SyncModelResult = {
  noop: number
  created: number
  updated: number
  deleted: number
}

export const emptySyncModelResult: SyncModelResult = {
  noop: 0,
  created: 0,
  updated: 0,
  deleted: 0,
}

export type SyncOperation = 'noop' | 'created' | 'updated' | 'deleted'
