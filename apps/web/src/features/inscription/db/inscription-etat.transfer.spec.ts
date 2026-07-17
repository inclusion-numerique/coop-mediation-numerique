import { Franchissement } from '../domain/franchissement'
import type {
  InscriptionEnCours,
  InscriptionEtat,
  InscriptionNonDemarree,
  InscriptionValidee,
} from '../domain/inscription-etat'
import { Role } from '../domain/role'
import { UserId } from '../domain/user-id'
import {
  inscriptionEtatFromDomain,
  inscriptionEtatToDomain,
} from './inscription-etat.transfer'

const userId = UserId('550e8400-e29b-41d4-a716-446655440000')
const id = '550e8400-e29b-41d4-a716-446655440000'
const cgu = new Date('2026-04-01T09:00:00Z')
const validee = new Date('2026-04-29T10:00:00Z')
const structure = new Date('2026-04-10T08:00:00Z')
const lieux = new Date('2026-04-20T08:00:00Z')

const roundTrip = (etat: InscriptionEtat) =>
  inscriptionEtatToDomain({ id, ...inscriptionEtatFromDomain(etat) })

describe('inscription état transfer layer', () => {
  it('round-trips une inscription non démarrée (min)', () => {
    const etat: InscriptionNonDemarree = { _tag: 'NonDemarree', userId }
    expect(roundTrip(etat)).toEqual(etat)
  })

  it('round-trips une inscription en cours, aucune étape franchie', () => {
    const etat: InscriptionEnCours = {
      _tag: 'EnCours',
      userId,
      role: Role('Coordinateur'),
      conseillerNumerique: false,
      acceptationCgu: cgu,
      progression: {
        structureEmployeuse: Franchissement(null),
        lieuxActivite: Franchissement(null),
      },
    }
    expect(roundTrip(etat)).toEqual(etat)
  })

  it('round-trips une inscription en cours, structure franchie seulement', () => {
    const etat: InscriptionEnCours = {
      _tag: 'EnCours',
      userId,
      role: Role('Mediateur'),
      conseillerNumerique: false,
      acceptationCgu: cgu,
      progression: {
        structureEmployeuse: Franchissement(structure),
        lieuxActivite: Franchissement(null),
      },
    }
    expect(roundTrip(etat)).toEqual(etat)
  })

  it('round-trips un conseiller numérique (préserve la variante d’enum via reflatten)', () => {
    const etat: InscriptionEnCours = {
      _tag: 'EnCours',
      userId,
      role: Role('Mediateur'),
      conseillerNumerique: true,
      acceptationCgu: cgu,
      progression: {
        structureEmployeuse: Franchissement(structure),
        lieuxActivite: Franchissement(lieux),
      },
    }
    expect(roundTrip(etat)).toEqual(etat)
  })

  it.each([
    { role: Role('Mediateur'), conseillerNumerique: false },
    { role: Role('Mediateur'), conseillerNumerique: true },
    { role: Role('Coordinateur'), conseillerNumerique: false },
    { role: Role('Coordinateur'), conseillerNumerique: true },
  ])('round-trips une inscription validée (max) pour %o', ({
    role,
    conseillerNumerique,
  }) => {
    const etat: InscriptionValidee = {
      _tag: 'Validee',
      userId,
      role,
      conseillerNumerique,
      acceptationCgu: cgu,
      progression: {
        structureEmployeuse: Franchissement(structure),
        lieuxActivite: Franchissement(lieux),
      },
      inscriptionValidee: validee,
    }
    expect(roundTrip(etat)).toEqual(etat)
  })

  it('rend EnCours avec des CGU en attente si le profil est posé sans CGU (flow Dataspace)', () => {
    expect(
      inscriptionEtatToDomain({
        id,
        profilInscription: 'Mediateur',
        isConseillerNumerique: false,
        acceptationCgu: null,
        structureEmployeuseRenseignee: null,
        lieuxActiviteRenseignes: null,
        inscriptionValidee: null,
      }),
    ).toEqual({
      _tag: 'EnCours',
      userId,
      role: 'Mediateur',
      conseillerNumerique: false,
      acceptationCgu: null,
      progression: {
        structureEmployeuse: Franchissement(null),
        lieuxActivite: Franchissement(null),
      },
    })
  })

  it('retombe sur NonDemarree sans profil : c’est le profil qui démarre l’inscription', () => {
    expect(
      inscriptionEtatToDomain({
        id,
        profilInscription: null,
        isConseillerNumerique: false,
        acceptationCgu: new Date('2026-07-01T00:00:00.000Z'),
        structureEmployeuseRenseignee: null,
        lieuxActiviteRenseignes: null,
        inscriptionValidee: null,
      }),
    ).toEqual({ _tag: 'NonDemarree', userId })
  })
})
