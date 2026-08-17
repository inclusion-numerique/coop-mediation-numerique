import type { CompteRdv } from '../../../domain/compte-rdv'
import { JetonAcces, type JetonsOAuth } from '../../../domain/jetons-oauth'
import { OrganisationId } from '../../../domain/organisation-id'
import { RdvAgentId } from '../../../domain/rdv-agent-id'
import { UtilisateurCoopId } from '../../../domain/utilisateur-coop-id'
import {
  organisationsARattraper,
  peutDeclencherPour,
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

describe('organisationsARattraper', () => {
  it('ne rend rien quand tous les webhooks sont posés', () => {
    expect(organisationsARattraper(compte([]))).toEqual([])
  })

  it('rend les organisations dont le webhook a échoué', () => {
    expect(organisationsARattraper(compte([10, 20]))).toEqual([10, 20])
  })
})

describe('porteePour', () => {
  it('parcourt toutes les organisations quand la synchronisation est demandée en entier', () => {
    expect(porteePour(compte([10]), false)).toEqual({
      _tag: 'toutesOrganisations',
    })
  })

  it('restreint le rattrapage aux organisations sans webhook', () => {
    expect(porteePour(compte([10, 20]), true)).toEqual({
      _tag: 'organisations',
      organisationIds: [10, 20],
    })
  })

  it('ne rattrape rien quand tous les webhooks sont posés — une portée vide n’est pas une portée absente', () => {
    expect(porteePour(compte([]), true)).toEqual({ _tag: 'sansObjet' })
  })

  it('n’appelle pas l’API pour un compte délié, même en synchronisation complète', () => {
    expect(porteePour(compteDeconnecte, false)).toEqual({ _tag: 'sansObjet' })
  })
})
