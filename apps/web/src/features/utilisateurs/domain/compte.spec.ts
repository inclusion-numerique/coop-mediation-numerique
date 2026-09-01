import { AdresseCourriel } from './adresse-courriel'
import type { CompteASupprimer } from './compte'
import {
  coordinateurDe,
  estSupprime,
  identifiantsDe,
  mediateurDe,
  type RattachementsDuCompte,
} from './compte'
import { CoordinateurId } from './coordinateur-id'
import { MediateurId } from './mediateur-id'
import { RoleUtilisateur } from './role-utilisateur'
import { UtilisateurId } from './utilisateur-id'

const MEDIATEUR = MediateurId('1a2b3c4d-5e6f-4708-8192-a3b4c5d6e7f8')
const COORDINATEUR = CoordinateurId('2b3c4d5e-6f70-4819-92a3-b4c5d6e7f809')

const aucun: RattachementsDuCompte = { _tag: 'aucun' }
const mediateur: RattachementsDuCompte = {
  _tag: 'mediateur',
  mediateurId: MEDIATEUR,
}
const coordinateur: RattachementsDuCompte = {
  _tag: 'coordinateur',
  coordinateurId: COORDINATEUR,
}
const lesDeux: RattachementsDuCompte = {
  _tag: 'mediateurEtCoordinateur',
  mediateurId: MEDIATEUR,
  coordinateurId: COORDINATEUR,
}

describe('projections des rattachements', () => {
  it.each([
    ['aucun', aucun, null, null],
    ['médiateur seul', mediateur, MEDIATEUR, null],
    ['coordinateur seul', coordinateur, null, COORDINATEUR],
    ['les deux', lesDeux, MEDIATEUR, COORDINATEUR],
  ])('%s', (_, rattachements, attenduMediateur, attenduCoordinateur) => {
    expect(mediateurDe(rattachements)).toBe(attenduMediateur)
    expect(coordinateurDe(rattachements)).toBe(attenduCoordinateur)
  })

  // C'est la traduction que toutes les features destinataires reçoivent : elles
  // ne connaissent pas l'union, seulement le couple.
  it('projette l’union vers le couple que les features attendent', () => {
    expect(identifiantsDe(lesDeux)).toEqual({
      mediateurId: MEDIATEUR,
      coordinateurId: COORDINATEUR,
    })
    expect(identifiantsDe(aucun)).toEqual({
      mediateurId: null,
      coordinateurId: null,
    })
  })
})

describe('compte supprimé', () => {
  const compte = (etat: CompteASupprimer['etat']): CompteASupprimer => ({
    id: UtilisateurId('0d1a1e7e-1f2b-4c3d-8e4f-5a6b7c8d9e0f'),
    courriel: AdresseCourriel('jean.dupont@example.com'),
    role: RoleUtilisateur('User'),
    etat,
    rattachements: aucun,
    liaisons: [],
  })

  it('l’est quand une date de suppression le dit', () => {
    expect(
      estSupprime(compte({ _tag: 'supprime', depuis: new Date('2026-01-01') })),
    ).toBe(true)
  })

  it('ne l’est pas tant qu’il est actif', () => {
    expect(estSupprime(compte({ _tag: 'actif' }))).toBe(false)
  })
})
