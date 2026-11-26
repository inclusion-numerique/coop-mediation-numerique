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
import {
  ApiIndisponible,
  ErreurTechnique,
  JetonRevoque,
} from '../../../domain/errors'
import { OrganisationId } from '../../../domain/identifiants/organisation-id'
import { RdvAgentId } from '../../../domain/identifiants/rdv-agent-id'
import { UtilisateurCoopId } from '../../../domain/identifiants/utilisateur-coop-id'
import {
  type Demandeur,
  declencherSynchronisation,
  MESSAGE_ECHEC,
} from './declencher-synchronisation'
import type { DeclencherSynchronisationPorts } from './ports'

const maintenant = new Date('2026-08-17T16:00:00.000Z')
const agentId = RdvAgentId(4242)
const moi = UtilisateurCoopId('d10844c6-b6de-402a-a68d-f8328b1d1b0c')
const autrui = UtilisateurCoopId('9c858901-8a57-4791-81fe-4c455b099bc9')

const jetons: JetonsOAuth = {
  acces: JetonAcces('jeton-acces'),
  rafraichissement: null,
  expiration: null,
  portee: null,
}

const base = {
  agentId,
  utilisateurId: moi,
  organisationIds: [OrganisationId(10), OrganisationId(20)],
  organisationIdsSansWebhook: [],
  synchroniserDepuis: null,
  derniereSynchro: null,
  inclureRdvsDansActivites: false,
}

const lie: CompteRdv = { ...base, _tag: 'lie', jetons }

const lieSansWebhook: CompteRdv = {
  ...lie,
  organisationIdsSansWebhook: [OrganisationId(20)],
}

const enErreur: CompteRdv = {
  ...base,
  _tag: 'enErreur',
  jetons,
  erreur: MessageErreurCompte('invalid_grant'),
}

const nonLie: CompteRdv = { ...base, _tag: 'nonLie' }

const ports = (compte: CompteRdv): DeclencherSynchronisationPorts => ({
  compteACible: async () => ({ compte, mediateurId: null }),
  synchroniser: async () => success({ derive: 3 }),
  marquerEchec: async () => undefined,
  signaler: () => undefined,
})

const mediateur: Demandeur = { id: moi, role: 'User' }
const administrateur: Demandeur = { id: autrui, role: 'Admin' }

const pourMoi = {
  demandeur: mediateur,
  utilisateurId: moi,
  seulementSansWebhook: false,
  maintenant,
}

const parUnAdministrateur = {
  ...pourMoi,
  demandeur: administrateur,
}

const synchronisee = success({ derive: 3, synchroniseeLe: maintenant })
const sansObjet = success({ derive: 0, synchroniseeLe: null })

describe('déclencher une synchronisation', () => {
  it('synchronise le compte du demandeur et rend la date de la passe', async () => {
    expect(await declencherSynchronisation(ports(lie))(pourMoi)).toEqual(
      synchronisee,
    )
  })

  it('refuse de synchroniser le compte d’un autre médiateur', async () => {
    expect(
      await declencherSynchronisation(ports(lie))({
        ...pourMoi,
        utilisateurId: autrui,
      }),
    ).toEqual(failure({ _tag: 'NonAutorise' }))
  })

  it('laisse un administrateur synchroniser le compte d’un tiers', async () => {
    expect(
      await declencherSynchronisation(ports(lie))(parUnAdministrateur),
    ).toEqual(synchronisee)
  })

  it('échoue sans compte RDV', async () => {
    expect(
      await declencherSynchronisation({
        ...ports(lie),
        compteACible: async () => null,
      })(pourMoi),
    ).toEqual(failure({ _tag: 'CompteRdvIntrouvable', utilisateurId: moi }))
  })

  it('n’a rien à faire pour un compte sans jetons', async () => {
    expect(await declencherSynchronisation(ports(nonLie))(pourMoi)).toEqual(
      sansObjet,
    )
  })

  it('ne relance pas un compte en erreur à la demande de son médiateur', async () => {
    expect(await declencherSynchronisation(ports(enErreur))(pourMoi)).toEqual(
      sansObjet,
    )
  })

  it('relance un compte en erreur à la demande d’un administrateur', async () => {
    expect(
      await declencherSynchronisation(ports(enErreur))(parUnAdministrateur),
    ).toEqual(synchronisee)
  })

  it('ne rattrape pas un compte en erreur, même pour un administrateur', async () => {
    expect(
      await declencherSynchronisation(ports(enErreur))({
        ...parUnAdministrateur,
        seulementSansWebhook: true,
      }),
    ).toEqual(sansObjet)
  })

  it('n’a rien à rattraper quand tous les webhooks sont posés', async () => {
    expect(
      await declencherSynchronisation(ports(lie))({
        ...pourMoi,
        seulementSansWebhook: true,
      }),
    ).toEqual(sansObjet)
  })

  it('rattrape les organisations sans webhook', async () => {
    expect(
      await declencherSynchronisation(ports(lieSansWebhook))({
        ...pourMoi,
        seulementSansWebhook: true,
      }),
    ).toEqual(synchronisee)
  })

  it('marque le compte quand l’échec appelle une reconnexion', async () => {
    expect(
      await declencherSynchronisation({
        ...ports(lie),
        synchroniser: async () => failure(JetonRevoque(agentId)),
      })(pourMoi),
    ).toEqual(
      failure({
        _tag: 'SynchronisationEchouee',
        marquage: { agentId, message: MESSAGE_ECHEC, le: maintenant },
      }),
    )
  })

  it.each<{ cas: string; echec: ApiIndisponible | ErreurTechnique }>([
    {
      cas: 'une API momentanément indisponible',
      echec: ApiIndisponible(503, 'maintenance'),
    },
    {
      cas: 'une erreur technique',
      echec: ErreurTechnique(new Error('connexion perdue')),
    },
  ])(
    'ne marque pas le compte pour $cas, qu’un nouvel essai résoudra',
    async ({ echec }) => {
      expect(
        await declencherSynchronisation({
          ...ports(lie),
          synchroniser: async () => failure(echec),
        })(pourMoi),
      ).toEqual(failure({ _tag: 'SynchronisationEchouee', marquage: null }))
    },
  )
})
