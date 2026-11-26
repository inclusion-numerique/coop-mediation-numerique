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
import {
  compteApresConnexion,
  connecterCompteRdv,
  type DependancesConnecterCompteRdv,
} from './connecter-compte-rdv'
import { CodeAutorisationRefuse } from './errors'

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

const compteBase = {
  agentId,
  utilisateurId,
  organisationIds: [OrganisationId(10)],
  organisationIdsSansWebhook: [OrganisationId(10)],
  synchroniserDepuis: new Date('2026-01-15T00:00:00.000Z'),
  derniereSynchro: new Date('2026-08-16T06:00:00.000Z'),
  inclureRdvsDansActivites: true,
} as const

describe('compteApresConnexion', () => {
  describe('première connexion', () => {
    const compte = compteApresConnexion({
      existant: null,
      agentId,
      utilisateurId,
      jetons,
      maintenant,
    })

    it('rend un compte lié', () => {
      expect(compte._tag).toBe('lie')
    })

    it('ouvre la fenêtre de synchronisation au début du jour courant', () => {
      expect(compte.synchroniserDepuis).toEqual(new Date(2026, 7, 17))
    })

    it('part sans organisation ni synchronisation antérieure', () => {
      expect(compte.organisationIds).toEqual([])
      expect(compte.derniereSynchro).toBeNull()
    })

    it('affiche les rendez-vous dans les activités', () => {
      expect(compte.inclureRdvsDansActivites).toBe(true)
    })
  })

  describe('reconnexion', () => {
    const reconnecter = (existant: CompteRdv) =>
      compteApresConnexion({
        existant,
        agentId,
        utilisateurId,
        jetons,
        maintenant,
      })

    it('relève un compte en erreur', () => {
      const compte = reconnecter({
        ...compteBase,
        _tag: 'enErreur',
        jetons: jetonsPrecedents,
        erreur: MessageErreurCompte('invalid_grant'),
      })

      expect(compte._tag).toBe('lie')
      expect(compte.jetons.acces).toBe('jeton-neuf')
    })

    it('relève un compte déconnecté — une reconnexion n’est pas destructive', () => {
      const compte = reconnecter({
        ...compteBase,
        _tag: 'deconnecte',
        deconnexion: new Date('2026-07-08T12:00:00.000Z'),
      })

      expect(compte._tag).toBe('lie')
    })

    it('préserve la fenêtre de synchronisation, pour ne pas perdre l’historique', () => {
      const compte = reconnecter({
        ...compteBase,
        _tag: 'lie',
        jetons: jetonsPrecedents,
      })

      expect(compte.synchroniserDepuis).toEqual(compteBase.synchroniserDepuis)
    })

    it('préserve les réglages et les organisations connues', () => {
      const compte = reconnecter({
        ...compteBase,
        _tag: 'lie',
        jetons: jetonsPrecedents,
      })

      expect(compte.inclureRdvsDansActivites).toBe(true)
      expect(compte.organisationIds).toEqual([OrganisationId(10)])
      expect(compte.organisationIdsSansWebhook).toEqual([OrganisationId(10)])
      expect(compte.derniereSynchro).toEqual(compteBase.derniereSynchro)
    })

    it('préserve l’affichage des rendez-vous désactivé par le médiateur', () => {
      const compte = reconnecter({
        ...compteBase,
        _tag: 'lie',
        jetons: jetonsPrecedents,
        inclureRdvsDansActivites: false,
      })

      expect(compte.inclureRdvsDansActivites).toBe(false)
    })
  })
})

const agent: Agent = {
  id: agentId,
  email: EmailExterne('agent@coop-numerique.anct.gouv.fr'),
  prenom: PrenomExterne('Camille'),
  nom: NomExterne('Martin'),
}

const compteEnregistre: CompteRdvLie = {
  ...compteBase,
  _tag: 'lie',
  jetons,
}

const dependances: DependancesConnecterCompteRdv = {
  echangerCode: async () => success(jetons),
  identifierAgent: async () => success(agent),
  compteExistant: async () => null,
  enregistrer: async () => compteEnregistre,
  maintenant: () => maintenant,
}

const demande = {
  utilisateurId,
  emailUtilisateur: EmailExterne('agent@coop-numerique.anct.gouv.fr'),
  code: CodeAutorisation('code-a-usage-unique'),
}

describe('connecterCompteRdv', () => {
  it('rend le compte enregistré quand la liaison aboutit', async () => {
    const resultat = await connecterCompteRdv(dependances)(demande)

    expect(resultat).toEqual(success(compteEnregistre))
  })

  it('remonte le refus du code d’autorisation sans identifier l’agent', async () => {
    const resultat = await connecterCompteRdv({
      ...dependances,
      echangerCode: async () =>
        failure(CodeAutorisationRefuse('invalid_grant')),
    })(demande)

    expect(resultat).toEqual(
      failure({ _tag: 'CodeAutorisationRefuse', detail: 'invalid_grant' }),
    )
  })

  it('remonte l’échec de l’identification de l’agent', async () => {
    const resultat = await connecterCompteRdv({
      ...dependances,
      identifierAgent: async () => failure(JetonRevoque(null)),
    })(demande)

    expect(resultat).toEqual(failure({ _tag: 'JetonRevoque', agentId: null }))
  })

  it('remonte une indisponibilité de l’API pendant l’identification', async () => {
    const resultat = await connecterCompteRdv({
      ...dependances,
      identifierAgent: async () => failure(ApiIndisponible(503, 'maintenance')),
    })(demande)

    expect(resultat).toEqual(
      failure({
        _tag: 'ApiIndisponible',
        statusCode: 503,
        message: 'maintenance',
      }),
    )
  })

  it('lie un agent dont l’adresse ne diffère que par la casse et les espaces', async () => {
    const resultat = await connecterCompteRdv(dependances)({
      ...demande,
      emailUtilisateur: EmailExterne('  Agent@Coop-Numerique.anct.gouv.fr  '),
    })

    expect(resultat).toEqual(success(compteEnregistre))
  })

  it('refuse de lier un agent qui ne porte pas l’adresse du compte La Coop', async () => {
    const resultat = await connecterCompteRdv(dependances)({
      ...demande,
      emailUtilisateur: EmailExterne('autre@coop-numerique.anct.gouv.fr'),
    })

    expect(resultat).toEqual(
      failure({
        _tag: 'EmailAgentDifferent',
        emailCoop: 'autre@coop-numerique.anct.gouv.fr',
        emailAgent: 'agent@coop-numerique.anct.gouv.fr',
      }),
    )
  })
})
