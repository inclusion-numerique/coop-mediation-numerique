import { describe, expect, it } from 'vitest'
import type {
  InscriptionEnCours,
  InscriptionNonDemarree,
} from './etat-de-l-inscription'
import { Franchissement } from './franchissement'
import { Role } from './role'
import {
  franchirLieuxActivite,
  franchirStructureEmployeuse,
  poserRole,
  valider,
} from './transitions'
import { UtilisateurId } from './utilisateur-id'

const userId = UtilisateurId('00000000-0000-4000-8000-000000000001')
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
    structureEmployeuse: Franchissement(acceptationCgu),
    lieuxActivite: Franchissement(null),
  },
}

const conseillerNumeriqueEnCours: InscriptionEnCours = {
  ...inscriptionEnCours,
  conseillerNumerique: true,
}

describe('poserRole', () => {
  it('démarre l’inscription sur le rôle choisi, CGU acceptées au même instant, avec une progression vierge et non conseiller numérique', () => {
    expect(poserRole(inscriptionNonDemarree, Role('Coordinateur'), le)).toEqual(
      {
        _tag: 'EnCours',
        userId,
        role: 'Coordinateur',
        conseillerNumerique: false,
        acceptationCgu: le,
        progression: {
          structureEmployeuse: { _tag: 'aFranchir' },
          lieuxActivite: { _tag: 'aFranchir' },
        },
      },
    )
  })

  it('remplace le rôle et la date de CGU lors d’un re-choix, en conservant les étapes déjà franchies', () => {
    expect(poserRole(structureDejaFranchie, Role('Coordinateur'), le)).toEqual({
      _tag: 'EnCours',
      userId,
      role: 'Coordinateur',
      conseillerNumerique: false,
      acceptationCgu: le,
      progression: {
        structureEmployeuse: { _tag: 'franchi', le: acceptationCgu },
        lieuxActivite: { _tag: 'aFranchir' },
      },
    })
  })

  it('conserve le statut conseiller numérique lors d’un re-choix', () => {
    expect(
      poserRole(conseillerNumeriqueEnCours, Role('Coordinateur'), le),
    ).toEqual({
      _tag: 'EnCours',
      userId,
      role: 'Coordinateur',
      conseillerNumerique: true,
      acceptationCgu: le,
      progression: {
        structureEmployeuse: { _tag: 'aFranchir' },
        lieuxActivite: { _tag: 'aFranchir' },
      },
    })
  })
})

describe('franchirStructureEmployeuse', () => {
  it('marque l’étape franchie à la date fournie et laisse l’étape lieux d’activité intacte', () => {
    expect(franchirStructureEmployeuse(inscriptionEnCours, le)).toEqual({
      _tag: 'EnCours',
      userId,
      role: 'Mediateur',
      conseillerNumerique: false,
      acceptationCgu,
      progression: {
        structureEmployeuse: { _tag: 'franchi', le },
        lieuxActivite: { _tag: 'aFranchir' },
      },
    })
  })
})

describe('franchirLieuxActivite', () => {
  it('marque l’étape franchie à la date fournie et laisse l’étape structure employeuse intacte', () => {
    expect(franchirLieuxActivite(structureDejaFranchie, le)).toEqual({
      _tag: 'EnCours',
      userId,
      role: 'Mediateur',
      conseillerNumerique: false,
      acceptationCgu,
      progression: {
        structureEmployeuse: { _tag: 'franchi', le: acceptationCgu },
        lieuxActivite: { _tag: 'franchi', le },
      },
    })
  })
})

describe('valider', () => {
  it('pose l’état terminal à la date fournie en conservant rôle, statut conseiller numérique, acceptation des CGU et progression', () => {
    expect(valider(structureDejaFranchie, le)).toEqual({
      _tag: 'Validee',
      userId,
      role: 'Mediateur',
      conseillerNumerique: false,
      acceptationCgu,
      progression: {
        structureEmployeuse: { _tag: 'franchi', le: acceptationCgu },
        lieuxActivite: { _tag: 'aFranchir' },
      },
      inscriptionValidee: le,
    })
  })
})
