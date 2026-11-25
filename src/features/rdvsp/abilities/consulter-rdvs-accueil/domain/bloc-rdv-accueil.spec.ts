import { describe, expect, it } from 'vitest'
import { UtilisateurCoopId } from '@/features/rdvsp/domain/identifiants/utilisateur-coop-id'
import { blocRdvAccueil } from './bloc-rdv-accueil'

const sansCompte = blocRdvAccueil({
  compteDuMediateur: async () => null,
  lireDonnees: async () => {
    throw new Error('aucune donnée à lire sans compte')
  },
})

describe('blocRdvAccueil', () => {
  it('ne rattrape rien au chargement sans compte RDV', async () => {
    const bloc = await sansCompte(
      UtilisateurCoopId('8a0f6f2e-6d1c-4d1b-9a43-0d7e2f0c1b2a'),
      new Date('2026-11-25T10:00:00Z'),
    )

    expect(bloc.synchroniserAuChargement).toBe(false)
  })
})
