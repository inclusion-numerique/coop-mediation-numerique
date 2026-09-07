import { Nom } from '@gouvfr-anct/lieux-de-mediation-numerique'
import { LieuId } from '../../../domain/lieu-id'
import { MediateurId } from '../../../domain/mediateur-id'
import { demandeDAjout } from './demande-d-ajout'
import type { LieuDemande } from './lieu-demande'

const mediateur = MediateurId('550e8400-e29b-41d4-a716-446655440001')

const demande: LieuDemande = {
  nom: Nom('Tiers-lieu du Port'),
  id: LieuId('0927f824-b84d-4840-ae2e-e4a96a7a519b'),
}

describe('ce qu’il faut réunir pour qu’un ajout ait un sens', () => {
  it('accepte un médiateur et au moins un lieu', () => {
    expect(
      demandeDAjout({ mediateurId: mediateur, demandes: [demande] }),
    ).toEqual({
      success: true,
      data: { mediateurId: mediateur, demandes: [demande] },
    })
  })

  /** Un lieu ne se rattache qu'à un médiateur : sans profil, rien à ajouter. */
  it('refuse sans médiateur', () => {
    expect(demandeDAjout({ mediateurId: null, demandes: [demande] })).toEqual({
      success: false,
      error: { _tag: 'MediateurRequis' },
    })
  })

  /** Un panier vide n'est pas une demande d'ajout. */
  it('refuse un panier vide', () => {
    expect(demandeDAjout({ mediateurId: mediateur, demandes: [] })).toEqual({
      success: false,
      error: { _tag: 'PanierVide' },
    })
  })

  /** L'absence de médiateur se dit avant le panier : c'est le refus le plus fort. */
  it('refuse d’abord l’absence de médiateur', () => {
    expect(demandeDAjout({ mediateurId: null, demandes: [] })).toEqual({
      success: false,
      error: { _tag: 'MediateurRequis' },
    })
  })
})
