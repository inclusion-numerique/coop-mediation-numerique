import { describe, expect, it } from 'vitest'
import { failure, success } from '@/libraries/result'
import {
  ActiviteId,
  BeneficiaireId,
  Commune,
  DateDActivite,
  DateTropLointaine,
  DureeEnMinutes,
  EmployeuseId,
  Genre,
  MediateurId,
  StatutSocial,
  ThematiqueDeMediation,
  TrancheDAge,
} from '../../../domain'
import {
  accompagnementDeLaSaisie,
  type BeneficiaireSaisi,
  beneficiaireAccompagneDe,
  type SaisieIndividuelle,
} from './saisie-individuelle'

const lyon = Commune({ nom: 'Lyon', codePostal: '69001', codeInsee: '69123' })

const profil = {
  genre: Genre('Feminin'),
  trancheDAge: TrancheDAge('VingtCinqTrenteNeuf'),
  statutSocial: StatutSocial('EnEmploi'),
  residence: lyon,
}

const beneficiaireSaisi: BeneficiaireSaisi = {
  id: null,
  dejaAccompagne: true,
  profil,
}

const suivi = BeneficiaireId('5b2d0c4e-8f1a-4c3b-9d7e-2a6f1b3c4d5e')

const saisie: SaisieIndividuelle = {
  id: null,
  date: DateDActivite('2026-11-05'),
  duree: DureeEnMinutes(45),
  lieu: { _tag: 'ADistance' },
  thematiques: {
    mediation: [ThematiqueDeMediation('DiagnosticNumerique')],
    demarche: null,
  },
  equipement: { _tag: 'NonRenseigne' },
  tags: [],
  notes: null,
  rdvId: null,
  beneficiaire: beneficiaireSaisi,
  autonomie: null,
  orientation: { _tag: 'NonRenseignee' },
}

const enregistrement: Parameters<typeof accompagnementDeLaSaisie>[0] = {
  saisie,
  id: ActiviteId('a0000000-0000-4000-8000-000000000001'),
  mediateurId: MediateurId('c0000000-0000-4000-8000-000000000001'),
  beneficiaire: { _tag: 'Suivi', id: suivi },
  employeuse: { id: EmployeuseId(17), commune: lyon },
  origine: { _tag: 'Saisie' },
  creation: new Date('2026-11-01T08:00:00Z'),
  maintenant: new Date('2026-11-10T08:00:00Z'),
}

describe('bénéficiaire d’un accompagnement individuel', () => {
  it('reste anonyme avec le profil saisi quand personne n’est suivi', () => {
    expect(beneficiaireAccompagneDe(beneficiaireSaisi, null)).toEqual({
      _tag: 'Anonyme',
      dejaAccompagne: true,
      profil,
    })
  })

  it('désigne le bénéficiaire suivi', () => {
    expect(beneficiaireAccompagneDe(beneficiaireSaisi, suivi)).toEqual({
      _tag: 'Suivi',
      id: suivi,
    })
  })
})

describe('saisie d’un accompagnement individuel', () => {
  it('construit l’accompagnement rattaché à l’employeuse du jour', () => {
    expect(accompagnementDeLaSaisie(enregistrement)).toEqual(
      success({
        _tag: 'Individuel',
        id: enregistrement.id,
        mediateurId: enregistrement.mediateurId,
        date: DateDActivite('2026-11-05'),
        duree: DureeEnMinutes(45),
        lieu: { _tag: 'ADistance', communeDeRattachement: lyon },
        thematiques: saisie.thematiques,
        equipement: { _tag: 'NonRenseigne' },
        tags: [],
        notes: null,
        origine: { _tag: 'Saisie' },
        employeuse: EmployeuseId(17),
        creation: enregistrement.creation,
        modification: enregistrement.maintenant,
        beneficiaire: { _tag: 'Suivi', id: suivi },
        autonomie: null,
        orientation: { _tag: 'NonRenseignee' },
      }),
    )
  })

  it('n’attribue aucune employeuse quand le médiateur n’en a pas ce jour-là', () => {
    expect(
      accompagnementDeLaSaisie({ ...enregistrement, employeuse: null }),
    ).toMatchObject({
      data: {
        employeuse: null,
        lieu: { _tag: 'ADistance', communeDeRattachement: null },
      },
    })
  })

  it('refuse une date au-delà de deux ans', () => {
    expect(
      accompagnementDeLaSaisie({
        ...enregistrement,
        saisie: { ...saisie, date: DateDActivite('2028-11-11') },
      }),
    ).toEqual(failure(DateTropLointaine(DateDActivite('2028-11-10'))))
  })
})
