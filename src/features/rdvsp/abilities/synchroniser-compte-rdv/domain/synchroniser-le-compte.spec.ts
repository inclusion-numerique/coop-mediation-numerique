import { describe, expect, it } from 'vitest'
import type { CompteRdv } from '@/features/rdvsp/domain/compte/compte-rdv'
import { RdvAgentId } from '@/features/rdvsp/domain/identifiants/rdv-agent-id'
import { UtilisateurCoopId } from '@/features/rdvsp/domain/identifiants/utilisateur-coop-id'
import { synchroniserLeCompte } from './synchroniser-le-compte'

const compteNonLie: CompteRdv = {
  _tag: 'nonLie',
  agentId: RdvAgentId(12),
  utilisateurId: UtilisateurCoopId('5b3e2a1c-7d4f-4e6a-9b8c-1d2e3f4a5b6c'),
  organisationIds: [],
  organisationIdsSansWebhook: [],
  synchroniserDepuis: null,
  derniereSynchro: null,
  inclureRdvsDansActivites: false,
}

const inattendu = async (): Promise<never> => {
  throw new Error('un compte inutilisable ne se synchronise pas')
}

describe('synchroniserLeCompte', () => {
  it('ne synchronise pas un compte inutilisable', async () => {
    expect(
      await synchroniserLeCompte({
        lireLeCompte: async () => compteNonLie,
        reconcilierOrganisations: inattendu,
        reconcilierLesRdvsDuMediateur: () => inattendu,
        reconcilierWebhooks: inattendu,
        detacherOrganisations: inattendu,
        ouvrirJournal: inattendu,
        cloturerJournal: inattendu,
        echouerJournal: inattendu,
        noterLaSynchronisationReussie: inattendu,
      })({ compteId: 12 }),
    ).toStrictEqual({ drift: 0 })
  })
})
