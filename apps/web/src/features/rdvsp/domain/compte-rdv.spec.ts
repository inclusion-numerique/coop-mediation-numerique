import {
  type CompteRdv,
  doitAlerterUtilisateur,
  estUtilisable,
  MessageErreurCompte,
} from './compte-rdv'
import { JetonAcces, type JetonsOAuth } from './jetons-oauth'
import { RdvAgentId } from './rdv-agent-id'
import { UtilisateurCoopId } from './utilisateur-coop-id'

const jetons: JetonsOAuth = {
  acces: JetonAcces('jeton-acces'),
  rafraichissement: null,
  expiration: null,
  portee: null,
}

const base = {
  agentId: RdvAgentId(42),
  utilisateurId: UtilisateurCoopId('3f2504e0-4f89-41d3-9a0c-0305e82c3301'),
  organisationIds: [],
  organisationIdsSansWebhook: [],
  synchroniserDepuis: null,
  derniereSynchro: null,
  inclureRdvsDansActivites: false,
} as const

const nonLie: CompteRdv = { ...base, _tag: 'nonLie' }
const lie: CompteRdv = { ...base, _tag: 'lie', jetons }
const enErreur: CompteRdv = {
  ...base,
  _tag: 'enErreur',
  jetons,
  erreur: MessageErreurCompte('invalid_grant'),
}
const deconnecte: CompteRdv = {
  ...base,
  _tag: 'deconnecte',
  deconnexion: new Date('2026-07-08T00:00:00.000Z'),
}

describe('estUtilisable', () => {
  it('retient un compte lié', () => {
    expect(estUtilisable(lie)).toBe(true)
  })

  it('retient un compte en erreur, dont les jetons peuvent redevenir valides', () => {
    expect(estUtilisable(enErreur)).toBe(true)
  })

  it.each([
    ['non lié', nonLie],
    ['déconnecté', deconnecte],
  ])('écarte un compte %s, qui n’a aucun jeton', (_, compte) => {
    expect(estUtilisable(compte)).toBe(false)
  })
})

describe('doitAlerterUtilisateur', () => {
  it('alerte sur un compte en erreur', () => {
    expect(doitAlerterUtilisateur(enErreur)).toBe(true)
  })

  it('n’alerte pas sur une déconnexion, qui est un choix de l’utilisateur', () => {
    expect(doitAlerterUtilisateur(deconnecte)).toBe(false)
  })

  it('n’alerte pas sur un compte qui fonctionne', () => {
    expect(doitAlerterUtilisateur(lie)).toBe(false)
  })
})
