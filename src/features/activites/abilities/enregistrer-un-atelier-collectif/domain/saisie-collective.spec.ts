import { describe, expect, it } from 'vitest'
import { failure, success } from '@/libraries/result'
import {
  ActiviteId,
  AtelierSansParticipant,
  BeneficiaireId,
  Commune,
  DateDActivite,
  DateTropLointaine,
  DureeEnMinutes,
  Effectif,
  EmployeuseId,
  LieuActiviteId,
  MediateurId,
  type ParticipantsAnonymes,
  ThematiqueDeMediation,
} from '../../../domain'
import { atelierDeLaSaisie, type SaisieCollective } from './saisie-collective'

const lyon = Commune({ nom: 'Lyon', codePostal: '69001', codeInsee: '69123' })

const suivi = BeneficiaireId('5b2d0c4e-8f1a-4c3b-9d7e-2a6f1b3c4d5e')

const sansAnonyme: ParticipantsAnonymes = {
  total: Effectif(0),
  dejaAccompagnes: Effectif(0),
  genres: {
    masculin: Effectif(0),
    feminin: Effectif(0),
    nonCommunique: Effectif(0),
  },
  tranchesDAge: {
    moinsDeDouze: Effectif(0),
    douzeDixHuit: Effectif(0),
    dixHuitVingtQuatre: Effectif(0),
    vingtCinqTrenteNeuf: Effectif(0),
    quaranteCinquanteNeuf: Effectif(0),
    soixanteSoixanteNeuf: Effectif(0),
    soixanteDixPlus: Effectif(0),
    nonCommunique: Effectif(0),
  },
  statutsSociaux: {
    scolarise: Effectif(0),
    sansEmploi: Effectif(0),
    enEmploi: Effectif(0),
    retraite: Effectif(0),
    nonCommunique: Effectif(0),
  },
}

const lieu = {
  _tag: 'LieuActivite',
  lieuActiviteId: LieuActiviteId('d0000000-0000-4000-8000-000000000001'),
} satisfies SaisieCollective['lieu']

const saisie: SaisieCollective = {
  id: null,
  date: DateDActivite('2026-11-05'),
  duree: DureeEnMinutes(90),
  lieu,
  thematiques: {
    mediation: [ThematiqueDeMediation('DiagnosticNumerique')],
    demarche: null,
  },
  equipement: { _tag: 'AucunMateriel' },
  tags: [],
  notes: null,
  rdvId: null,
  titre: null,
  niveau: null,
  suivis: [suivi],
  anonymes: sansAnonyme,
}

const enregistrement: Parameters<typeof atelierDeLaSaisie>[0] = {
  saisie,
  id: ActiviteId('a0000000-0000-4000-8000-000000000002'),
  mediateurId: MediateurId('c0000000-0000-4000-8000-000000000001'),
  employeuse: { id: EmployeuseId(17), commune: lyon },
  origine: { _tag: 'Saisie' },
  creation: new Date('2026-11-01T08:00:00Z'),
  maintenant: new Date('2026-11-10T08:00:00Z'),
}

describe('saisie d’un atelier collectif', () => {
  it('construit l’atelier avec ses participants, rattaché à l’employeuse du jour', () => {
    expect(atelierDeLaSaisie(enregistrement)).toEqual(
      success({
        _tag: 'Collectif',
        id: enregistrement.id,
        mediateurId: enregistrement.mediateurId,
        date: DateDActivite('2026-11-05'),
        duree: DureeEnMinutes(90),
        lieu,
        thematiques: saisie.thematiques,
        equipement: { _tag: 'AucunMateriel' },
        tags: [],
        notes: null,
        origine: { _tag: 'Saisie' },
        employeuse: EmployeuseId(17),
        creation: enregistrement.creation,
        modification: enregistrement.maintenant,
        titre: null,
        niveau: null,
        participants: { suivis: [suivi], anonymes: sansAnonyme },
      }),
    )
  })

  it('n’attribue aucune employeuse quand le médiateur n’en a pas ce jour-là', () => {
    expect(
      atelierDeLaSaisie({ ...enregistrement, employeuse: null }),
    ).toMatchObject({ data: { employeuse: null } })
  })

  it('refuse une date au-delà de deux ans', () => {
    expect(
      atelierDeLaSaisie({
        ...enregistrement,
        saisie: { ...saisie, date: DateDActivite('2028-11-11') },
      }),
    ).toEqual(failure(DateTropLointaine(DateDActivite('2028-11-10'))))
  })

  it('refuse un atelier sans participant', () => {
    expect(
      atelierDeLaSaisie({
        ...enregistrement,
        saisie: { ...saisie, suivis: [] },
      }),
    ).toEqual(failure(AtelierSansParticipant()))
  })
})
