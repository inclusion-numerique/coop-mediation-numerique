import { type CompteRdv, MessageErreurCompte } from '../../../domain/compte-rdv'
import { JetonAcces, type JetonsOAuth } from '../../../domain/jetons-oauth'
import { OrganisationId } from '../../../domain/organisation-id'
import { RdvAgentId } from '../../../domain/rdv-agent-id'
import { UtilisateurCoopId } from '../../../domain/utilisateur-coop-id'
import {
  peutDeclencherPour,
  peutRelancerUnCompteEnErreur,
  porteePour,
} from './declencher-synchronisation'

const moi = UtilisateurCoopId('d10844c6-b6de-402a-a68d-f8328b1d1b0c')
const autrui = UtilisateurCoopId('9c858901-8a57-4791-81fe-4c455b099bc9')

const jetons: JetonsOAuth = {
  acces: JetonAcces('jeton-acces'),
  rafraichissement: null,
  expiration: null,
  portee: null,
}

const socle = {
  agentId: RdvAgentId(4242),
  utilisateurId: moi,
  organisationIds: [],
  synchroniserDepuis: null,
  derniereSynchro: null,
  inclureRdvsDansActivites: false,
} as const

const compte = (sansWebhook: number[]): CompteRdv => ({
  ...socle,
  _tag: 'lie',
  jetons,
  organisationIdsSansWebhook: sansWebhook.map((id) => OrganisationId(id)),
})

const compteEnErreur: CompteRdv = {
  ...socle,
  _tag: 'enErreur',
  jetons,
  erreur: MessageErreurCompte('Impossible de récupérer les données'),
  organisationIdsSansWebhook: [OrganisationId(10)],
}

const compteDeconnecte: CompteRdv = {
  ...socle,
  _tag: 'deconnecte',
  deconnexion: new Date('2026-08-01T10:00:00Z'),
  organisationIdsSansWebhook: [OrganisationId(10)],
}

describe('peutDeclencherPour', () => {
  it('autorise chacun pour lui-même', () => {
    expect(peutDeclencherPour({ id: moi, role: 'User' }, moi)).toBe(true)
  })

  it('refuse un médiateur pour le compte d’un autre', () => {
    expect(peutDeclencherPour({ id: moi, role: 'User' }, autrui)).toBe(false)
  })

  it.each(['Admin', 'Support'] as const)(
    'autorise un profil %s pour n’importe qui — la synchronisation est aussi un dépannage',
    (role) => {
      expect(peutDeclencherPour({ id: moi, role }, autrui)).toBe(true)
    },
  )
})

describe('porteePour', () => {
  it('parcourt toutes les organisations quand la synchronisation est demandée en entier', () => {
    expect(porteePour(compte([10]), false, false)).toEqual({
      _tag: 'toutesOrganisations',
    })
  })

  it('restreint le rattrapage aux organisations sans webhook', () => {
    expect(porteePour(compte([10, 20]), true, false)).toEqual({
      _tag: 'organisations',
      organisationIds: [10, 20],
    })
  })

  it('ne rattrape rien quand tous les webhooks sont posés — une portée vide n’est pas une portée absente', () => {
    expect(porteePour(compte([]), true, false)).toEqual({ _tag: 'sansObjet' })
  })

  it('n’appelle pas l’API pour un compte délié, même en synchronisation complète', () => {
    expect(porteePour(compteDeconnecte, false, false)).toEqual({
      _tag: 'sansObjet',
    })
  })
})

describe('compte en erreur', () => {
  it('n’est plus synchronisé à la demande de son médiateur', () => {
    expect(porteePour(compteEnErreur, false, false)).toEqual({
      _tag: 'sansObjet',
    })
  })

  it('n’est pas rattrapé au chargement d’un écran', () => {
    expect(porteePour(compteEnErreur, true, true)).toEqual({
      _tag: 'sansObjet',
    })
  })

  it('peut être relancé en entier par l’assistance', () => {
    expect(porteePour(compteEnErreur, false, true)).toEqual({
      _tag: 'toutesOrganisations',
    })
  })

  it.each([
    ['Admin', true],
    ['Support', true],
    ['User', false],
  ] as const)('relance autorisée pour un profil %s : %s', (role, attendu) => {
    expect(peutRelancerUnCompteEnErreur({ id: moi, role })).toBe(attendu)
  })
})
