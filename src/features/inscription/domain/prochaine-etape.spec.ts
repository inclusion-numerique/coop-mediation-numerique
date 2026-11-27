import { describe, expect, it } from 'vitest'
import type {
  InscriptionEnCours,
  InscriptionNonDemarree,
} from './etat-de-l-inscription'
import { Franchissement } from './franchissement'
import { prochaineEtape } from './prochaine-etape'
import { Role } from './role'
import { TypeDeParcours } from './type-de-parcours'
import { UtilisateurId } from './utilisateur-id'

const userId = UtilisateurId('550e8400-e29b-41d4-a716-446655440000')
const le = new Date('2026-02-02T09:00:00.000Z')

const sansDataspace = {
  flowType: TypeDeParcours('withoutDataspace'),
  hasLieuxActivite: false,
}
const avecDataspace = {
  flowType: TypeDeParcours('withDataspace'),
  hasLieuxActivite: false,
}

const nonDemarree: InscriptionNonDemarree = { _tag: 'NonDemarree', userId }

const mediateurSansStructure: InscriptionEnCours = {
  _tag: 'EnCours',
  userId,
  role: Role('Mediateur'),
  conseillerNumerique: false,
  acceptationCgu: new Date('2026-01-01T10:00:00.000Z'),
  progression: {
    structureEmployeuse: Franchissement(null),
    lieuxActivite: Franchissement(null),
  },
}

const mediateurAvecStructure: InscriptionEnCours = {
  ...mediateurSansStructure,
  progression: {
    structureEmployeuse: Franchissement(le),
    lieuxActivite: Franchissement(null),
  },
}

const mediateurAyantToutFranchi: InscriptionEnCours = {
  ...mediateurSansStructure,
  progression: {
    structureEmployeuse: Franchissement(le),
    lieuxActivite: Franchissement(le),
  },
}

const coordinateur: InscriptionEnCours = {
  ...mediateurSansStructure,
  role: Role('Coordinateur'),
}

const conseillerNumeriqueSansStructure: InscriptionEnCours = {
  ...mediateurSansStructure,
  conseillerNumerique: true,
}

const conseillerNumeriqueAvecStructure: InscriptionEnCours = {
  ...mediateurAvecStructure,
  conseillerNumerique: true,
}

const coordinateurConseillerNumerique: InscriptionEnCours = {
  ...coordinateur,
  conseillerNumerique: true,
}

describe('prochaineEtape', () => {
  it('une inscription non démarrée reprend au choix du rôle', () => {
    expect(prochaineEtape(nonDemarree, sansDataspace)).toBe('choisir-role')
  })

  it('un coordinateur (aucune porte à franchir) est directement au récapitulatif', () => {
    expect(prochaineEtape(coordinateur, sansDataspace)).toBe('recapitulatif')
  })

  it('un médiateur sans structure reprend à la vérification des informations', () => {
    expect(prochaineEtape(mediateurSansStructure, sansDataspace)).toBe(
      'verifier-informations',
    )
  })

  it('un médiateur avec structure mais sans lieux reprend aux lieux d’activité', () => {
    expect(prochaineEtape(mediateurAvecStructure, sansDataspace)).toBe(
      'lieux-activite',
    )
  })

  it('un médiateur ayant tout franchi est au récapitulatif', () => {
    expect(prochaineEtape(mediateurAyantToutFranchi, sansDataspace)).toBe(
      'recapitulatif',
    )
  })

  it('un conseiller numérique Dataspace sans lieu reprend à la vérification', () => {
    expect(
      prochaineEtape(conseillerNumeriqueSansStructure, avecDataspace),
    ).toBe('verifier-informations')
  })

  it('un conseiller numérique Dataspace, structure franchie, est au récapitulatif, sa branche n’ayant pas de successeur', () => {
    expect(
      prochaineEtape(conseillerNumeriqueAvecStructure, avecDataspace),
    ).toBe('recapitulatif')
  })

  it('un conseiller numérique Dataspace avec lieux connus est directement au récapitulatif', () => {
    expect(
      prochaineEtape(conseillerNumeriqueSansStructure, {
        ...avecDataspace,
        hasLieuxActivite: true,
      }),
    ).toBe('recapitulatif')
  })

  it('un coordinateur conseiller numérique Dataspace est directement au récapitulatif', () => {
    expect(prochaineEtape(coordinateurConseillerNumerique, avecDataspace)).toBe(
      'recapitulatif',
    )
  })
})
