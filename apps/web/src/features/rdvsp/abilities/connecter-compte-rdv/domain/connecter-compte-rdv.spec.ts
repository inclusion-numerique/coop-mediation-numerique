import type { CompteRdv } from '../../../domain/compte-rdv'
import { MessageErreurCompte } from '../../../domain/compte-rdv'
import { EmailExterne } from '../../../domain/identite'
import { JetonAcces, type JetonsOAuth } from '../../../domain/jetons-oauth'
import { OrganisationId } from '../../../domain/organisation-id'
import { RdvAgentId } from '../../../domain/rdv-agent-id'
import { UtilisateurCoopId } from '../../../domain/utilisateur-coop-id'
import {
  compteApresConnexion,
  emailsCorrespondent,
} from './connecter-compte-rdv'

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
      expect(compte.inclureRdvsDansActivites).toBe(false)
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
  })
})

describe('emailsCorrespondent', () => {
  it('accepte deux adresses identiques', () => {
    expect(
      emailsCorrespondent(
        EmailExterne('agent@coop-numerique.anct.gouv.fr'),
        EmailExterne('agent@coop-numerique.anct.gouv.fr'),
      ),
    ).toBe(true)
  })

  it('ignore la casse et les espaces, normalisés par le value object', () => {
    expect(
      emailsCorrespondent(
        EmailExterne('Agent@Coop-Numerique.anct.gouv.fr'),
        EmailExterne('  agent@coop-numerique.anct.gouv.fr  '),
      ),
    ).toBe(true)
  })

  it('refuse deux adresses distinctes', () => {
    expect(
      emailsCorrespondent(
        EmailExterne('agent@coop-numerique.anct.gouv.fr'),
        EmailExterne('autre@coop-numerique.anct.gouv.fr'),
      ),
    ).toBe(false)
  })
})
