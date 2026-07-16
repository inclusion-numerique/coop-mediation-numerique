import { estFranchi, Franchissement } from './franchissement'
import type {
  InscriptionEnCours,
  InscriptionNonDemarree,
} from './inscription-etat'
import { Role } from './role'
import {
  franchirLieuxActivite,
  franchirStructureEmployeuse,
  poserRole,
  valider,
} from './transitions'
import { UserId } from './user-id'

const userId = UserId('00000000-0000-4000-8000-000000000001')
const acceptationCgu = new Date('2026-01-01T10:00:00.000Z')
const le = new Date('2026-02-02T09:00:00.000Z')

const inscriptionNonDemarree: InscriptionNonDemarree = {
  _tag: 'NonDemarree',
  userId,
}

const inscriptionEnCours: InscriptionEnCours = {
  _tag: 'EnCours',
  userId,
  role: Role('Mediateur'),
  conseillerNumerique: false,
  acceptationCgu,
  progression: {
    structureEmployeuse: Franchissement(null),
    lieuxActivite: Franchissement(null),
  },
}

const structureDejaFranchie: InscriptionEnCours = {
  ...inscriptionEnCours,
  progression: {
    ...inscriptionEnCours.progression,
    structureEmployeuse: Franchissement(acceptationCgu),
  },
}

describe('poserRole', () => {
  it('démarre l’inscription sur le rôle choisi, CGU acceptées au même instant', () => {
    const etat = poserRole(inscriptionNonDemarree, Role('Coordinateur'), le)

    expect(etat._tag).toBe('EnCours')
    expect(etat.role).toBe('Coordinateur')
    expect(etat.acceptationCgu).toEqual(le)
  })

  it('démarre avec une progression vierge et non conseiller numérique', () => {
    const etat = poserRole(inscriptionNonDemarree, Role('Mediateur'), le)

    expect(estFranchi(etat.progression.structureEmployeuse)).toBe(false)
    expect(estFranchi(etat.progression.lieuxActivite)).toBe(false)
    expect(etat.conseillerNumerique).toBe(false)
  })

  it('remplace le rôle et la date de CGU lors d’un re-choix', () => {
    const etat = poserRole(structureDejaFranchie, Role('Coordinateur'), le)

    expect(etat.role).toBe('Coordinateur')
    expect(etat.acceptationCgu).toEqual(le)
  })

  it('conserve les étapes déjà franchies lors d’un re-choix', () => {
    const { progression } = poserRole(
      structureDejaFranchie,
      Role('Coordinateur'),
      le,
    )

    expect(progression.structureEmployeuse).toEqual({
      _tag: 'franchi',
      le: acceptationCgu,
    })
  })

  it('conserve le statut conseiller numérique lors d’un re-choix', () => {
    const conseillerNumerique: InscriptionEnCours = {
      ...inscriptionEnCours,
      conseillerNumerique: true,
    }

    expect(
      poserRole(conseillerNumerique, Role('Coordinateur'), le)
        .conseillerNumerique,
    ).toBe(true)
  })
})

describe('franchirStructureEmployeuse', () => {
  it('marque l’étape franchie à la date fournie', () => {
    const { progression } = franchirStructureEmployeuse(inscriptionEnCours, le)

    expect(progression.structureEmployeuse).toEqual({ _tag: 'franchi', le })
  })

  it('laisse l’étape lieux d’activité intacte', () => {
    const { progression } = franchirStructureEmployeuse(inscriptionEnCours, le)

    expect(estFranchi(progression.lieuxActivite)).toBe(false)
  })
})

describe('franchirLieuxActivite', () => {
  it('marque l’étape franchie à la date fournie', () => {
    const { progression } = franchirLieuxActivite(inscriptionEnCours, le)

    expect(progression.lieuxActivite).toEqual({ _tag: 'franchi', le })
  })

  it('laisse l’étape structure employeuse intacte', () => {
    const { progression } = franchirLieuxActivite(structureDejaFranchie, le)

    expect(progression.structureEmployeuse).toEqual({
      _tag: 'franchi',
      le: acceptationCgu,
    })
  })
})

describe('valider', () => {
  it('pose l’état terminal à la date fournie', () => {
    const etat = valider(inscriptionEnCours, le)

    expect(etat._tag).toBe('Validee')
    expect(etat.inscriptionValidee).toEqual(le)
  })

  it('conserve rôle, statut CN, acceptation des CGU et progression', () => {
    const etat = valider(structureDejaFranchie, le)

    expect(etat.role).toBe('Mediateur')
    expect(etat.conseillerNumerique).toBe(false)
    expect(etat.acceptationCgu).toEqual(acceptationCgu)
    expect(etat.progression).toEqual(structureDejaFranchie.progression)
  })
})
