import { type CompteRdv, MessageErreurCompte } from '../../../domain/compte-rdv'
import { JetonAcces, type JetonsOAuth } from '../../../domain/jetons-oauth'
import { OrganisationId } from '../../../domain/organisation-id'
import { RdvAgentId } from '../../../domain/rdv-agent-id'
import { UtilisateurCoopId } from '../../../domain/utilisateur-coop-id'
import { type DonneesAccueilRdv, rdvsPassesTotal } from './donnees-accueil-rdv'
import { synchroniserAuChargement, widgetPour } from './widget-rdv'

const jetons: JetonsOAuth = {
  acces: JetonAcces('jeton-acces'),
  rafraichissement: null,
  expiration: null,
  portee: null,
}

const base = {
  agentId: RdvAgentId(4242),
  utilisateurId: UtilisateurCoopId('d10844c6-b6de-402a-a68d-f8328b1d1b0c'),
  organisationIds: [],
  organisationIdsSansWebhook: [],
  synchroniserDepuis: null,
  derniereSynchro: null,
  inclureRdvsDansActivites: false,
} as const

const donnees: DonneesAccueilRdv = {
  aVenir: 3,
  prochain: null,
  passes: 2,
  honores: 5,
  dernier: null,
  organisationPrincipale: null,
}

describe('widgetPour', () => {
  it('affiche les données d’un compte lié', () => {
    const widget = widgetPour({ ...base, _tag: 'lie', jetons }, donnees)

    expect(widget._tag).toBe('donnees')
  })

  it('masque la section pour un médiateur sans compte', () => {
    expect(widgetPour(null, null)._tag).toBe('masque')
  })

  it('masque la section pour un compte délié, sans crier à l’erreur', () => {
    // Écart assumé : l'ancien calcul, qui ne regardait que la présence de jetons,
    // affichait une alerte d'erreur à qui venait de se déconnecter volontairement.
    const widget = widgetPour(
      {
        ...base,
        _tag: 'deconnecte',
        deconnexion: new Date('2026-07-08T00:00:00.000Z'),
      },
      null,
    )

    expect(widget._tag).toBe('masque')
  })

  it('alerte sur un compte en erreur', () => {
    const widget = widgetPour(
      {
        ...base,
        _tag: 'enErreur',
        jetons,
        erreur: MessageErreurCompte('invalid_grant'),
      },
      null,
    )

    expect(widget._tag).toBe('alerte')
  })

  it('alerte sur un compte resté non lié', () => {
    expect(widgetPour({ ...base, _tag: 'nonLie' }, null)._tag).toBe('alerte')
  })

  it('alerte plutôt que de se taire si les données manquent', () => {
    const widget = widgetPour({ ...base, _tag: 'lie', jetons }, null)

    expect(widget._tag).toBe('alerte')
  })
})

describe('synchroniserAuChargement', () => {
  it('déclenche une synchronisation quand un webhook manque', () => {
    const compte: CompteRdv = {
      ...base,
      _tag: 'lie',
      jetons,
      organisationIdsSansWebhook: [OrganisationId(10)],
    }

    expect(synchroniserAuChargement(compte)).toBe(true)
  })

  it('ne déclenche rien quand tous les webhooks sont posés', () => {
    expect(synchroniserAuChargement({ ...base, _tag: 'lie', jetons })).toBe(
      false,
    )
  })
})

describe('rdvsPassesTotal', () => {
  it('additionne les rendez-vous échus et ceux honorés sans compte rendu', () => {
    expect(rdvsPassesTotal(donnees)).toBe(7)
  })
})
