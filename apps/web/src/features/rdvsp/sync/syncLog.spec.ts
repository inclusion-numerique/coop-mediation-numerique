import { computeSyncDrift } from './syncLog'

describe('syncLog', () => {
  it('should compute the drift correctly', () => {
    const syncResult = {
      rdvs: { noop: 0, created: 1, updated: 1, deleted: 1 },
      organisations: { noop: 0, created: 1, updated: 1, deleted: 1 },
      webhooks: { noop: 10, created: 0, updated: 0, deleted: 0 },
      users: { noop: 8, created: 2, updated: 0, deleted: 0 },
      motifs: { noop: 10, created: 0, updated: 0, deleted: 0 },
      lieux: { noop: 1, created: 1, updated: 2, deleted: 2 },
      invalidWebhookOrganisationIds: [1, 2, 3],
    }

    const syncResultWithDrift = computeSyncDrift(syncResult)

    expect(syncResultWithDrift.drift).toBe(3 + 3 + 2 + 5)
    expect(syncResultWithDrift.rdvs.drift).toBe(3)
    expect(syncResultWithDrift.organisations.drift).toBe(3)
    expect(syncResultWithDrift.webhooks.drift).toBe(0)
    expect(syncResultWithDrift.users.drift).toBe(2)
    expect(syncResultWithDrift.motifs.drift).toBe(0)
    expect(syncResultWithDrift.lieux.drift).toBe(5)
  })
})
