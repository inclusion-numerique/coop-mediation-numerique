import { describe, expect, it } from 'vitest'
import { failure, success } from '@/libraries/result'
import {
  type CompteRdv,
  MessageErreurCompte,
} from '../../../domain/compte/compte-rdv'
import {
  JetonAcces,
  type JetonsOAuth,
} from '../../../domain/compte/jetons-oauth'
import { RdvAgentId } from '../../../domain/identifiants/rdv-agent-id'
import { UtilisateurCoopId } from '../../../domain/identifiants/utilisateur-coop-id'
import { synchroniserTousLesComptesRdv } from './synchroniser-tous-les-comptes-rdv'

const maintenant = new Date('2026-11-26T03:00:00.000Z')

const jetons: JetonsOAuth = {
  acces: JetonAcces('jeton-acces'),
  rafraichissement: null,
  expiration: null,
  portee: null,
}

const base = (utilisateurId: string) => ({
  agentId: RdvAgentId(4242),
  utilisateurId: UtilisateurCoopId(utilisateurId),
  organisationIds: [],
  organisationIdsSansWebhook: [],
  synchroniserDepuis: null,
  derniereSynchro: null,
  inclureRdvsDansActivites: false,
})

const operationnel: CompteRdv = {
  ...base('11111111-1111-4111-8111-111111111111'),
  _tag: 'lie',
  jetons,
}

const jetonExpire: CompteRdv = {
  ...base('22222222-2222-4222-8222-222222222222'),
  _tag: 'lie',
  jetons: { ...jetons, expiration: new Date('2026-11-25T03:00:00.000Z') },
}

const enErreur: CompteRdv = {
  ...base('33333333-3333-4333-8333-333333333333'),
  _tag: 'enErreur',
  jetons,
  erreur: MessageErreurCompte('invalid_grant'),
}

const jamaisLie: CompteRdv = {
  ...base('44444444-4444-4444-8444-444444444444'),
  _tag: 'nonLie',
}

const deconnecte: CompteRdv = {
  ...base('55555555-5555-4555-8555-555555555555'),
  _tag: 'deconnecte',
  deconnexion: new Date('2026-07-08T00:00:00.000Z'),
}

const comptes = async () => [
  operationnel,
  jetonExpire,
  enErreur,
  jamaisLie,
  deconnecte,
]

describe('synchroniserTousLesComptesRdv', () => {
  it('ne synchronise que les comptes opérationnels ou au jeton renouvelable', async () => {
    const bilan = await synchroniserTousLesComptesRdv({
      lireLesComptes: comptes,
      declencher: async () => success({ derive: 0 }),
    })(maintenant)

    expect(bilan).toEqual({
      comptes: 5,
      eligibles: 2,
      synchronises: 2,
      echecs: [],
    })
  })

  it('consigne l’échec de chaque compte sans interrompre les suivants', async () => {
    const bilan = await synchroniserTousLesComptesRdv({
      lireLesComptes: comptes,
      declencher: async () => failure({ _tag: 'SynchronisationEchouee' }),
    })(maintenant)

    expect(bilan).toEqual({
      comptes: 5,
      eligibles: 2,
      synchronises: 0,
      echecs: [
        {
          utilisateurId: operationnel.utilisateurId,
          raison: 'SynchronisationEchouee',
        },
        {
          utilisateurId: jetonExpire.utilisateurId,
          raison: 'SynchronisationEchouee',
        },
      ],
    })
  })

  it('rend un bilan vide quand aucun compte n’existe', async () => {
    const bilan = await synchroniserTousLesComptesRdv({
      lireLesComptes: async () => [],
      declencher: async () => success({ derive: 0 }),
    })(maintenant)

    expect(bilan).toEqual({
      comptes: 0,
      eligibles: 0,
      synchronises: 0,
      echecs: [],
    })
  })
})
