export type SyncOperation = 'noop' | 'created' | 'updated' | 'deleted'

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

export type SyncResult = {
  rdvs: SyncModelResult
  organisations: SyncModelResult
  webhooks: SyncModelResult
  users: SyncModelResult
  motifs: SyncModelResult
  lieux: SyncModelResult
}

export const emptySyncResult: SyncResult = {
  rdvs: emptySyncModelResult,
  organisations: emptySyncModelResult,
  webhooks: emptySyncModelResult,
  users: emptySyncModelResult,
  motifs: emptySyncModelResult,
  lieux: emptySyncModelResult,
}

export type SyncModelResultWithDrift = SyncModelResult & {
  drift: number
}
export type SyncResultWithDrift = {
  drift: number
  rdvs: SyncModelResultWithDrift
  organisations: SyncModelResultWithDrift
  webhooks: SyncModelResultWithDrift
  users: SyncModelResultWithDrift
  motifs: SyncModelResultWithDrift
  lieux: SyncModelResultWithDrift
}

export const computeSyncDrift = (
  syncResult: SyncResult,
): SyncResultWithDrift => {
  const result: SyncResultWithDrift = {
    drift: 0,
    rdvs: { ...syncResult.rdvs, drift: 0 },
    organisations: { ...syncResult.organisations, drift: 0 },
    webhooks: { ...syncResult.webhooks, drift: 0 },
    users: { ...syncResult.users, drift: 0 },
    motifs: { ...syncResult.motifs, drift: 0 },
    lieux: { ...syncResult.lieux, drift: 0 },
  }

  for (const modelUntyped of Object.keys(syncResult)) {
    const model = modelUntyped as keyof SyncResult
    const modelDrift =
      syncResult[model].created +
      syncResult[model].deleted +
      syncResult[model].updated

    result[model].drift = modelDrift
    result.drift += modelDrift
  }

  return result
}
