import type { CompteRdvUtilisable } from '../../../domain/compte-rdv'
import { JetonAcces, type JetonsOAuth } from '../../../domain/jetons-oauth'
import { OrganisationId } from '../../../domain/organisation-id'
import { RdvAgentId } from '../../../domain/rdv-agent-id'
import { UtilisateurCoopId } from '../../../domain/utilisateur-coop-id'
import { passePour } from './synchroniser-compte-rdv'

const jetons: JetonsOAuth = {
  acces: JetonAcces('jeton-acces'),
  rafraichissement: null,
  expiration: null,
  portee: null,
}

const compte: CompteRdvUtilisable = {
  _tag: 'lie',
  jetons,
  agentId: RdvAgentId(4242),
  utilisateurId: UtilisateurCoopId('d10844c6-b6de-402a-a68d-f8328b1d1b0c'),
  organisationIds: [],
  organisationIdsSansWebhook: [],
  synchroniserDepuis: null,
  derniereSynchro: null,
  inclureRdvsDansActivites: false,
}

describe('passePour', () => {
  it('couvre tout quand aucune organisation n’est précisée', () => {
    expect(passePour({ compte })).toEqual({
      _tag: 'aExecuter',
      toutesOrganisations: true,
      organisationIds: undefined,
    })
  })

  it('ne couvre rien quand la liste d’organisations est vide', () => {
    // La distinction tient à un tableau vide contre une absence de tableau :
    // l'inverser resynchroniserait tout un compte pour rien.
    expect(passePour({ compte, organisationIds: [] })._tag).toBe('sansObjet')
  })

  it('se restreint aux organisations demandées', () => {
    const passe = passePour({
      compte,
      organisationIds: [OrganisationId(10)],
    })

    expect(passe).toEqual({
      _tag: 'aExecuter',
      toutesOrganisations: false,
      organisationIds: [10],
    })
  })

  it('ne réconcilie les organisations que sur une passe complète', () => {
    const restreinte = passePour({
      compte,
      organisationIds: [OrganisationId(10)],
    })

    expect(
      restreinte._tag === 'aExecuter' && restreinte.toutesOrganisations,
    ).toBe(false)
  })
})
