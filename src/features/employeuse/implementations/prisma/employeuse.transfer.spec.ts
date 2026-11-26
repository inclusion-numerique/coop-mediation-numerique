import { describe, expect, it } from 'vitest'
import {
  contratsToDomain,
  employeuseToDomain,
  type PersonneEmployeusePayload,
  personneToEmployeuseActuelle,
} from './employeuse.transfer'

type AffectationRow = PersonneEmployeusePayload['affectationsEmploi'][number]
type EmployeuseRow = AffectationRow['structureAdministrative']

const ligneComplete: EmployeuseRow = {
  id: 42,
  createdAt: new Date('2020-01-01'),
  updatedAt: new Date('2026-01-01'),
  deletedAt: null,
  denominationSirene: 'ASSOCIATION DES TESTS',
  denominationAntenne: 'Antenne de Nantes',
  siret: '12345678901234',
  rna: 'W123456789',
  contact: { nom: 'Piaf', prenom: 'Edith', telephone: '0102030405' },
  adresse: {
    numeroVoie: 12,
    repetition: 'bis',
    nomVoie: 'rue des Tests',
    codePostal: '44000',
    codeInsee: '44109',
    nomCommune: 'Nantes',
  },
}

const ligneMinimale: EmployeuseRow = {
  id: 43,
  createdAt: null,
  updatedAt: null,
  deletedAt: null,
  denominationSirene: null,
  denominationAntenne: null,
  siret: null,
  rna: null,
  contact: null,
  adresse: null,
}

describe('employeuseToDomain', () => {
  it('valide et brande une ligne complète', () => {
    expect(employeuseToDomain(ligneComplete)).toEqual({
      id: 42,
      creation: new Date('2020-01-01'),
      modification: new Date('2026-01-01'),
      suppression: null,
      denomination: 'Antenne de Nantes',
      denominationSirene: 'ASSOCIATION DES TESTS',
      siret: '12345678901234',
      rna: 'W123456789',
      adresse: {
        voie: '12 bis rue des Tests',
        codePostal: '44000',
        codeInsee: '44109',
        commune: 'Nantes',
      },
      contactReferent: {
        _tag: 'renseigne',
        nom: 'Edith Piaf',
        courriel: null,
        telephone: '0102030405',
      },
    })
  })

  it('rend explicites les absences d’une ligne minimale', () => {
    expect(employeuseToDomain(ligneMinimale)).toEqual({
      id: 43,
      creation: null,
      modification: null,
      suppression: null,
      denomination: null,
      denominationSirene: null,
      siret: null,
      rna: null,
      adresse: null,
      contactReferent: { _tag: 'nonRenseigne' },
    })
  })

  it('préfère la dénomination d’antenne, sinon celle de SIRENE', () => {
    expect(
      employeuseToDomain({ ...ligneComplete, denominationAntenne: null })
        .denomination,
    ).toBe('ASSOCIATION DES TESTS')
  })

  it('écarte un SIRET hors format sans perdre le reste', () => {
    const employeuse = employeuseToDomain({
      ...ligneComplete,
      siret: 'siret-invalide',
    })
    expect(employeuse.siret).toBeNull()
    expect(employeuse.denomination).toBe('Antenne de Nantes')
  })
})

describe('contratsToDomain', () => {
  it('conserve chaque contrat, y compris chez la même employeuse', () => {
    const contrats = contratsToDomain(
      [
        {
          structureAdministrative: ligneComplete,
          dateDebut: new Date('2024-01-01'),
          dateFin: new Date('2024-12-31'),
          dateRupture: null,
        },
        {
          structureAdministrative: ligneComplete,
          dateDebut: new Date('2026-01-01'),
          dateFin: null,
          dateRupture: null,
        },
      ],
      new Date('2026-06-01'),
    )

    expect(contrats.map(({ periode }) => periode)).toEqual([
      {
        _tag: 'terminee',
        debut: new Date('2024-01-01'),
        fin: new Date('2024-12-31'),
      },
      { _tag: 'enCours', debut: new Date('2026-01-01'), finPrevue: null },
    ])
    expect(contrats.every(({ employeuse }) => employeuse.id === 42)).toBe(true)
  })

  it('écarte les contrats sans structure', () => {
    expect(
      contratsToDomain([
        {
          structureAdministrative: null,
          dateDebut: new Date('2026-01-01'),
          dateFin: null,
          dateRupture: null,
        },
      ]),
    ).toEqual([])
  })
})

describe('personneToEmployeuseActuelle', () => {
  it('compose la personne chargée en employeuse courante', () => {
    const actuelle = personneToEmployeuseActuelle({
      employeuseActuelle: {
        source: 'coop',
        structureAdministrative: ligneComplete,
      },
      contrats: [
        {
          structureAdministrative: ligneComplete,
          dateDebut: new Date('2026-03-01'),
          dateFin: null,
          dateRupture: null,
        },
      ],
    })

    expect(actuelle?.employeuse.id).toBe(42)
    expect(actuelle?.source).toBe('coop')
    expect(actuelle?.periode).toEqual({
      _tag: 'enCours',
      debut: new Date('2026-03-01'),
      finPrevue: null,
    })
  })

  it('n’a pas d’employeuse sans personne', () => {
    expect(personneToEmployeuseActuelle(null)).toBeNull()
  })
})
