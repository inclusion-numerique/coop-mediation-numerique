import { describe, expect, it } from 'vitest'
import { bilanVide } from '@/features/rdvsp/domain/compte/bilan-synchronisation'
import type { CompteRdv } from '@/features/rdvsp/domain/compte/compte-rdv'
import { JetonAcces } from '@/features/rdvsp/domain/compte/jetons-oauth'
import {
  AccesRefuse,
  AgentSupprime,
  ApiIndisponible,
  type ErreurRdvApi,
  JetonRevoque,
  ReponseInattendue,
} from '@/features/rdvsp/domain/errors'
import { OrganisationId } from '@/features/rdvsp/domain/identifiants/organisation-id'
import { RdvAgentId } from '@/features/rdvsp/domain/identifiants/rdv-agent-id'
import { UtilisateurCoopId } from '@/features/rdvsp/domain/identifiants/utilisateur-coop-id'
import { failure, success } from '@/libraries/result'
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

const compteLie: CompteRdv = {
  ...compteNonLie,
  _tag: 'lie',
  organisationIds: [OrganisationId(10), OrganisationId(20)],
  jetons: {
    acces: JetonAcces('jeton-acces'),
    rafraichissement: null,
    expiration: null,
    portee: null,
  },
}

const mediateurId = '0b8e3f9a-4c2d-4e1f-8a7b-6c5d4e3f2a1b'

const rdvsReconcilies = {
  rdvs: { ...bilanVide, created: 2, deleted: 1 },
  usagers: { ...bilanVide, updated: 1 },
  motifs: { ...bilanVide, created: 1, deleted: 5 },
  lieux: { ...bilanVide, noop: 4 },
  organisationIdsInaccessibles: [],
}

const dependances = {
  lireLeCompte: async () => compteLie,
  reconcilierOrganisations: async () =>
    success({
      bilan: { ...bilanVide, created: 1 },
      organisationIdsRecues: [OrganisationId(10), OrganisationId(20)],
    }),
  reconcilierLesRdvsDuMediateur: () => async () => success(rdvsReconcilies),
  reconcilierWebhooks: async () => ({
    bilan: { ...bilanVide, created: 1 },
    organisationIdsSansWebhook: undefined,
  }),
  detacherOrganisations: async () => undefined,
  ouvrirJournal: async () => ({ journalId: 'journal-1' }),
  cloturerJournal: async () => undefined,
  echouerJournal: async () => undefined,
  noterLaSynchronisationReussie: async () => undefined,
}

const organisationsEnEchec = async () =>
  failure(ApiIndisponible(503, 'maintenance'))

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

  it('mesure la dérive de toute la passe, sans compter les motifs ramassés', async () => {
    const resultat = await synchroniserLeCompte(dependances)({
      compteId: 12,
      mediateurId,
    })

    expect(resultat).toEqual({ drift: 7 })
  })

  it('ne réconcilie pas les rendez-vous d’un compte sans médiateur rattaché', async () => {
    const resultat = await synchroniserLeCompte(dependances)({ compteId: 12 })

    expect(resultat).toEqual({ drift: 2 })
  })

  it('ne fait rien quand la liste d’organisations demandée est vide — une portée vide n’est pas une portée totale', async () => {
    const resultat = await synchroniserLeCompte({
      ...dependances,
      reconcilierOrganisations: organisationsEnEchec,
    })({ compteId: 12, mediateurId, organisationIds: [] })

    expect(resultat).toEqual({ drift: 0 })
  })

  it('ne réconcilie les organisations que sur une passe complète', async () => {
    const resultat = await synchroniserLeCompte({
      ...dependances,
      reconcilierOrganisations: organisationsEnEchec,
    })({ compteId: 12, mediateurId, organisationIds: [10] })

    expect(resultat).toEqual({ drift: 6 })
  })

  it('poursuit la passe après avoir détaché les organisations devenues inaccessibles', async () => {
    const resultat = await synchroniserLeCompte({
      ...dependances,
      reconcilierLesRdvsDuMediateur: () => async () =>
        success({
          ...rdvsReconcilies,
          organisationIdsInaccessibles: [OrganisationId(20)],
        }),
    })({ compteId: 12, mediateurId, organisationIds: [10, 20] })

    expect(resultat).toEqual({ drift: 6 })
  })

  it.each<[string, ErreurRdvApi, string]>([
    [
      'un jeton révoqué',
      JetonRevoque(RdvAgentId(12)),
      'Impossible de synchroniser le compte RDV (JetonRevoque)',
    ],
    [
      'un accès refusé',
      AccesRefuse('/organisations', null),
      'Impossible de synchroniser le compte RDV (AccesRefuse : /organisations)',
    ],
    [
      'un agent supprimé',
      AgentSupprime('/agents/me'),
      'Impossible de synchroniser le compte RDV (AgentSupprime : /agents/me)',
    ],
    [
      'une API indisponible',
      ApiIndisponible(503, 'maintenance'),
      'Impossible de synchroniser le compte RDV (ApiIndisponible : 503 maintenance)',
    ],
    [
      'une réponse inattendue',
      ReponseInattendue('/organisations', 'champ name absent'),
      'Impossible de synchroniser le compte RDV (ReponseInattendue : /organisations champ name absent)',
    ],
  ])(
    'échoue en nommant %s lors de la réconciliation des organisations',
    async (_, erreur, message) => {
      await expect(
        synchroniserLeCompte({
          ...dependances,
          reconcilierOrganisations: async () => failure(erreur),
        })({ compteId: 12, mediateurId }),
      ).rejects.toMatchObject({ motif: erreur._tag, message })
    },
  )

  it('échoue quand la réconciliation des rendez-vous échoue', async () => {
    await expect(
      synchroniserLeCompte({
        ...dependances,
        reconcilierLesRdvsDuMediateur: () => async () =>
          failure(ApiIndisponible(502, 'Bad Gateway')),
      })({ compteId: 12, mediateurId }),
    ).rejects.toMatchObject({
      motif: 'ApiIndisponible',
      message:
        'Impossible de synchroniser le compte RDV (ApiIndisponible : 502 Bad Gateway)',
    })
  })

  it('propage une erreur technique survenue en cours de passe', async () => {
    await expect(
      synchroniserLeCompte({
        ...dependances,
        reconcilierWebhooks: async () => {
          throw new Error('connexion perdue')
        },
      })({ compteId: 12, mediateurId }),
    ).rejects.toThrow('connexion perdue')
  })

  it('propage tel quel ce qui est levé sans être une erreur', async () => {
    await expect(
      synchroniserLeCompte({
        ...dependances,
        reconcilierWebhooks: async () => {
          throw 'connexion perdue'
        },
      })({ compteId: 12, mediateurId }),
    ).rejects.toBe('connexion perdue')
  })
})
