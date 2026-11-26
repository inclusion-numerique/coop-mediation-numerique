import { describe, expect, it } from 'vitest'
import { failure, success } from '@/libraries/result'
import type { Agent } from '../../../domain/agent'
import type { CompteRdv, CompteRdvLie } from '../../../domain/compte/compte-rdv'
import { MessageErreurCompte } from '../../../domain/compte/compte-rdv'
import {
  JetonAcces,
  type JetonsOAuth,
} from '../../../domain/compte/jetons-oauth'
import { ApiIndisponible, JetonRevoque } from '../../../domain/errors'
import { OrganisationId } from '../../../domain/identifiants/organisation-id'
import { RdvAgentId } from '../../../domain/identifiants/rdv-agent-id'
import { UtilisateurCoopId } from '../../../domain/identifiants/utilisateur-coop-id'
import {
  EmailExterne,
  NomExterne,
  PrenomExterne,
} from '../../../domain/identite'
import { CodeAutorisation } from './code-autorisation'
import { connecterCompteRdv } from './connecter-compte-rdv'
import { CodeAutorisationRefuse } from './errors'
import type { ConnecterCompteRdvPorts } from './ports'

const utilisateurId = UtilisateurCoopId('d10844c6-b6de-402a-a68d-f8328b1d1b0c')
const agentId = RdvAgentId(4242)
const maintenant = new Date('2026-08-17T14:30:00.000Z')

const jetons: JetonsOAuth = {
  acces: JetonAcces('jeton-neuf'),
  rafraichissement: null,
  expiration: null,
  portee: null,
}

const jetonsPrecedents: JetonsOAuth = {
  acces: JetonAcces('jeton-perime'),
  rafraichissement: null,
  expiration: null,
  portee: null,
}

const reglagesConserves = {
  agentId,
  utilisateurId,
  organisationIds: [OrganisationId(10)],
  organisationIdsSansWebhook: [OrganisationId(10)],
  synchroniserDepuis: new Date('2026-01-15T00:00:00.000Z'),
  derniereSynchro: new Date('2026-08-16T06:00:00.000Z'),
  inclureRdvsDansActivites: false,
}

const agent: Agent = {
  id: agentId,
  email: EmailExterne('agent@coop-numerique.anct.gouv.fr'),
  prenom: PrenomExterne('Camille'),
  nom: NomExterne('Martin'),
}

const premierCompte: CompteRdvLie = {
  _tag: 'lie',
  agentId,
  utilisateurId,
  jetons,
  organisationIds: [],
  organisationIdsSansWebhook: [],
  synchroniserDepuis: new Date(2026, 7, 17),
  derniereSynchro: null,
  inclureRdvsDansActivites: true,
}

const compteRelie: CompteRdvLie = {
  ...reglagesConserves,
  _tag: 'lie',
  jetons,
}

const ports: ConnecterCompteRdvPorts = {
  echangerCode: async () => success(jetons),
  identifierAgent: async () => success(agent),
  compteExistant: async () => null,
  enregistrer: async () => undefined,
}

const demande = {
  utilisateurId,
  emailUtilisateur: EmailExterne('agent@coop-numerique.anct.gouv.fr'),
  code: CodeAutorisation('code-a-usage-unique'),
  maintenant,
}

describe('connecter un compte RDV', () => {
  it('lie un premier compte : fenêtre ouverte au début du jour, sans organisation, rendez-vous affichés', async () => {
    expect(await connecterCompteRdv(ports)(demande)).toEqual(
      success({ compte: premierCompte, agentIdPrecedent: null }),
    )
  })

  it.each<{ cas: string; existant: CompteRdv }>([
    {
      cas: 'relève un compte en erreur avec les nouveaux jetons',
      existant: {
        ...reglagesConserves,
        _tag: 'enErreur',
        jetons: jetonsPrecedents,
        erreur: MessageErreurCompte('invalid_grant'),
      },
    },
    {
      cas: 'relève un compte déconnecté, une reconnexion n’étant pas destructive',
      existant: {
        ...reglagesConserves,
        _tag: 'deconnecte',
        deconnexion: new Date('2026-07-08T12:00:00.000Z'),
      },
    },
    {
      cas: 'préserve la fenêtre, les organisations et les réglages d’un compte déjà lié',
      existant: { ...reglagesConserves, _tag: 'lie', jetons: jetonsPrecedents },
    },
  ])('$cas', async ({ existant }) => {
    expect(
      await connecterCompteRdv({
        ...ports,
        compteExistant: async () => existant,
      })(demande),
    ).toEqual(success({ compte: compteRelie, agentIdPrecedent: agentId }))
  })

  it('lie un agent dont l’adresse ne diffère que par la casse et les espaces', async () => {
    expect(
      await connecterCompteRdv(ports)({
        ...demande,
        emailUtilisateur: EmailExterne('  Agent@Coop-Numerique.anct.gouv.fr  '),
      }),
    ).toEqual(success({ compte: premierCompte, agentIdPrecedent: null }))
  })

  it('remonte le refus du code d’autorisation sans identifier l’agent', async () => {
    expect(
      await connecterCompteRdv({
        ...ports,
        echangerCode: async () =>
          failure(CodeAutorisationRefuse('invalid_grant')),
      })(demande),
    ).toEqual(
      failure({ _tag: 'CodeAutorisationRefuse', detail: 'invalid_grant' }),
    )
  })

  it('remonte l’échec de l’identification de l’agent', async () => {
    expect(
      await connecterCompteRdv({
        ...ports,
        identifierAgent: async () => failure(JetonRevoque(null)),
      })(demande),
    ).toEqual(failure({ _tag: 'JetonRevoque', agentId: null }))
  })

  it('remonte une indisponibilité de l’API pendant l’identification', async () => {
    expect(
      await connecterCompteRdv({
        ...ports,
        identifierAgent: async () =>
          failure(ApiIndisponible(503, 'maintenance')),
      })(demande),
    ).toEqual(
      failure({
        _tag: 'ApiIndisponible',
        statusCode: 503,
        message: 'maintenance',
      }),
    )
  })

  it('refuse de lier un agent qui ne porte pas l’adresse du compte La Coop', async () => {
    expect(
      await connecterCompteRdv(ports)({
        ...demande,
        emailUtilisateur: EmailExterne('autre@coop-numerique.anct.gouv.fr'),
      }),
    ).toEqual(
      failure({
        _tag: 'EmailAgentDifferent',
        emailCoop: 'autre@coop-numerique.anct.gouv.fr',
        emailAgent: 'agent@coop-numerique.anct.gouv.fr',
      }),
    )
  })
})
