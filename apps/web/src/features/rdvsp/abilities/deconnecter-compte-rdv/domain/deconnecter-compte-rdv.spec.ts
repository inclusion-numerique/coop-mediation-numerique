import type { CompteRdv } from '../../../domain/compte-rdv'
import { MessageErreurCompte } from '../../../domain/compte-rdv'
import { JetonAcces, type JetonsOAuth } from '../../../domain/jetons-oauth'
import { OrganisationId } from '../../../domain/organisation-id'
import { RdvAgentId } from '../../../domain/rdv-agent-id'
import { UtilisateurCoopId } from '../../../domain/utilisateur-coop-id'
import { compteApresDeconnexion } from './deconnecter-compte-rdv'

const maintenant = new Date('2026-08-17T16:00:00.000Z')

const jetons: JetonsOAuth = {
  acces: JetonAcces('jeton-acces'),
  rafraichissement: null,
  expiration: null,
  portee: null,
}

const base = {
  agentId: RdvAgentId(4242),
  utilisateurId: UtilisateurCoopId('d10844c6-b6de-402a-a68d-f8328b1d1b0c'),
  organisationIds: [OrganisationId(10), OrganisationId(20)],
  organisationIdsSansWebhook: [OrganisationId(20)],
  synchroniserDepuis: new Date('2026-01-15T00:00:00.000Z'),
  derniereSynchro: new Date('2026-08-16T06:00:00.000Z'),
  inclureRdvsDansActivites: true,
} as const

const lie: CompteRdv = { ...base, _tag: 'lie', jetons }

describe('compteApresDeconnexion', () => {
  it('marque le compte déconnecté à l’instant demandé', () => {
    const compte = compteApresDeconnexion(lie, maintenant)

    expect(compte._tag).toBe('deconnecte')
    expect(compte.deconnexion).toEqual(maintenant)
  })

  it('déconnecte aussi un compte en erreur', () => {
    const compte = compteApresDeconnexion(
      {
        ...base,
        _tag: 'enErreur',
        jetons,
        erreur: MessageErreurCompte('invalid_grant'),
      },
      maintenant,
    )

    expect(compte._tag).toBe('deconnecte')
  })

  it('déconnecte un compte jamais lié, sans rien exiger de plus', () => {
    const compte = compteApresDeconnexion(
      { ...base, _tag: 'nonLie' },
      maintenant,
    )

    expect(compte._tag).toBe('deconnecte')
  })

  it('conserve ce qui permettra de reprendre la synchronisation', () => {
    const compte = compteApresDeconnexion(lie, maintenant)

    expect(compte.synchroniserDepuis).toEqual(base.synchroniserDepuis)
    expect(compte.derniereSynchro).toEqual(base.derniereSynchro)
    expect(compte.organisationIds).toEqual(base.organisationIds)
    expect(compte.organisationIdsSansWebhook).toEqual(
      base.organisationIdsSansWebhook,
    )
  })

  it('conserve les réglages d’affichage du médiateur', () => {
    expect(
      compteApresDeconnexion(lie, maintenant).inclureRdvsDansActivites,
    ).toBe(true)
  })

  it('ne réécrit pas la date d’une déconnexion déjà actée', () => {
    const premiereDeconnexion = new Date('2026-07-08T12:00:00.000Z')

    const compte = compteApresDeconnexion(
      { ...base, _tag: 'deconnecte', deconnexion: premiereDeconnexion },
      maintenant,
    )

    expect(compte.deconnexion).toEqual(premiereDeconnexion)
  })
})
