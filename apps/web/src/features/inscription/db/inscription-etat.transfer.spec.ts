import { Franchissement } from '../domain/franchissement'
import type {
  InscriptionEnCours,
  InscriptionEtat,
  InscriptionNonDemarree,
  InscriptionValidee,
} from '../domain/inscription-etat'
import {
  ProfilInscription,
  profilsInscription,
} from '../domain/profil-inscription'
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
      profil: ProfilInscription('Coordinateur'),
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
      profil: ProfilInscription('Mediateur'),
      acceptationCgu: cgu,
      progression: {
        structureEmployeuse: Franchissement(structure),
        lieuxActivite: Franchissement(null),
      },
    }
    expect(roundTrip(etat)).toEqual(etat)
  })

  it('round-trips une inscription en cours, structure et lieux franchis', () => {
    const etat: InscriptionEnCours = {
      _tag: 'EnCours',
      userId,
      profil: ProfilInscription('ConseillerNumerique'),
      acceptationCgu: cgu,
      progression: {
        structureEmployeuse: Franchissement(structure),
        lieuxActivite: Franchissement(lieux),
      },
    }
    expect(roundTrip(etat)).toEqual(etat)
  })

  it.each(
    profilsInscription,
  )('round-trips une inscription validée (max) pour le profil %s', (profil) => {
    const etat: InscriptionValidee = {
      _tag: 'Validee',
      userId,
      profil: ProfilInscription(profil),
      acceptationCgu: cgu,
      progression: {
        structureEmployeuse: Franchissement(structure),
        lieuxActivite: Franchissement(lieux),
      },
      inscriptionValidee: validee,
    }
    expect(roundTrip(etat)).toEqual(etat)
  })

  it('retombe sur NonDemarree si profil posé mais CGU manquantes (garde conservatrice)', () => {
    expect(
      inscriptionEtatToDomain({
        id,
        profilInscription: 'Mediateur',
        acceptationCgu: null,
        structureEmployeuseRenseignee: null,
        lieuxActiviteRenseignes: null,
        inscriptionValidee: null,
      }),
    ).toEqual({ _tag: 'NonDemarree', userId })
  })
})
