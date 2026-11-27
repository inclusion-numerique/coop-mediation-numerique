import { describe, expect, it } from 'vitest'
import { failure, success } from '@/libraries/result'
import { DureeEnMinutes } from '../duree-en-minutes'
import { Effectif } from '../effectif'
import {
  AtelierSansParticipant,
  AucuneThematique,
  AucunMaterielAvecMateriel,
  BeneficiaireEnDouble,
  DejaAccompagnesExcedeLeTotal,
  MaterielEnDouble,
  RepartitionExcedeLeTotal,
  ThematiqueEnDouble,
  TropDeParticipantsAnonymes,
} from '../errors'
import { BeneficiaireId } from '../identifiants/beneficiaire-id'
import {
  aucuneParticipationAnonyme,
  equipementDe,
  type ParticipantsAnonymes,
  participantsAnonymesDe,
  participantsDeLAtelier,
  thematiquesDe,
} from './activite-de-mediation'
import { Materiel } from './materiel'
import { ThematiqueAdministrative } from './thematique-administrative'
import { ThematiqueDeMediation } from './thematique-de-mediation'

const beneficiaire = BeneficiaireId('5b2d0c4e-8f1a-4c3b-9d7e-2a6f1b3c4d5e')

describe('durée', () => {
  it('accepte 23 h 59', () => {
    expect(DureeEnMinutes.safe(1439)).toBe(1439)
  })

  it('ne dépasse pas 23 h 59', () => {
    expect(DureeEnMinutes.safe(1440)).toBeNull()
  })
})

describe('thématiques', () => {
  it('exige au moins une thématique', () => {
    expect(thematiquesDe({ mediation: [], demarche: null })).toEqual(
      failure(AucuneThematique()),
    )
  })

  it('accepte l’aide aux démarches seule', () => {
    const thematiques = {
      mediation: [],
      demarche: { thematiques: [], precision: null },
    }
    expect(thematiquesDe(thematiques)).toEqual(success(thematiques))
  })

  it('refuse une thématique en double', () => {
    expect(
      thematiquesDe({
        mediation: [],
        demarche: {
          thematiques: [
            ThematiqueAdministrative('Logement'),
            ThematiqueAdministrative('Logement'),
          ],
          precision: null,
        },
      }),
    ).toEqual(failure(ThematiqueEnDouble()))
  })

  it('accepte des thématiques de médiation', () => {
    const thematiques = {
      mediation: [ThematiqueDeMediation('Email')],
      demarche: null,
    }
    expect(thematiquesDe(thematiques)).toEqual(success(thematiques))
  })
})

describe('équipement', () => {
  it('ne renseigne rien sans matériel', () => {
    expect(equipementDe({ aucunMateriel: false, materiels: [] })).toEqual(
      success({ _tag: 'NonRenseigne' }),
    )
  })

  it('déclare l’absence de matériel', () => {
    expect(equipementDe({ aucunMateriel: true, materiels: [] })).toEqual(
      success({ _tag: 'AucunMateriel' }),
    )
  })

  it('refuse « aucun matériel » avec un matériel', () => {
    expect(
      equipementDe({ aucunMateriel: true, materiels: [Materiel('Tablette')] }),
    ).toEqual(failure(AucunMaterielAvecMateriel()))
  })

  it('refuse un matériel en double', () => {
    expect(
      equipementDe({
        aucunMateriel: false,
        materiels: [Materiel('Tablette'), Materiel('Tablette')],
      }),
    ).toEqual(failure(MaterielEnDouble()))
  })

  it('liste les matériels utilisés', () => {
    expect(
      equipementDe({
        aucunMateriel: false,
        materiels: [Materiel('Ordinateur'), Materiel('Telephone')],
      }),
    ).toEqual(
      success({ _tag: 'Materiels', materiels: ['Ordinateur', 'Telephone'] }),
    )
  })
})

describe('participants anonymes', () => {
  const saisie = {
    ...aucuneParticipationAnonyme,
    total: Effectif(10),
    dejaAccompagnes: Effectif(4),
    genres: { masculin: Effectif(3), feminin: Effectif(5) },
  }

  it('range le reliquat de chaque répartition en non communiqué', () => {
    expect(participantsAnonymesDe(saisie)).toEqual(
      success({
        total: Effectif(10),
        dejaAccompagnes: Effectif(4),
        genres: {
          masculin: Effectif(3),
          feminin: Effectif(5),
          nonCommunique: Effectif(2),
        },
        tranchesDAge: {
          ...aucuneParticipationAnonyme.tranchesDAge,
          nonCommunique: Effectif(10),
        },
        statutsSociaux: {
          ...aucuneParticipationAnonyme.statutsSociaux,
          nonCommunique: Effectif(10),
        },
      }),
    )
  })

  it('refuse une répartition qui dépasse le total', () => {
    expect(
      participantsAnonymesDe({
        ...saisie,
        statutsSociaux: {
          ...saisie.statutsSociaux,
          retraite: Effectif(11),
        },
      }),
    ).toEqual(failure(RepartitionExcedeLeTotal('statutSocial')))
  })

  it('refuse une répartition par tranche d’âge qui dépasse le total', () => {
    expect(
      participantsAnonymesDe({
        ...saisie,
        tranchesDAge: {
          ...saisie.tranchesDAge,
          soixanteDixPlus: Effectif(11),
        },
      }),
    ).toEqual(failure(RepartitionExcedeLeTotal('trancheDAge')))
  })

  it('refuse plus de personnes déjà accompagnées que de participants', () => {
    expect(
      participantsAnonymesDe({ ...saisie, dejaAccompagnes: Effectif(11) }),
    ).toEqual(failure(DejaAccompagnesExcedeLeTotal()))
  })

  it('refuse plus de 10 000 participants anonymes', () => {
    expect(
      participantsAnonymesDe({ ...saisie, total: Effectif(10_001) }),
    ).toEqual(failure(TropDeParticipantsAnonymes()))
  })
})

describe('participants d’un atelier', () => {
  const anonymes: ParticipantsAnonymes = {
    total: Effectif(0),
    dejaAccompagnes: Effectif(0),
    genres: {
      ...aucuneParticipationAnonyme.genres,
      nonCommunique: Effectif(0),
    },
    tranchesDAge: {
      ...aucuneParticipationAnonyme.tranchesDAge,
      nonCommunique: Effectif(0),
    },
    statutsSociaux: {
      ...aucuneParticipationAnonyme.statutsSociaux,
      nonCommunique: Effectif(0),
    },
  }

  it('exige au moins un participant', () => {
    expect(participantsDeLAtelier({ suivis: [], anonymes })).toEqual(
      failure(AtelierSansParticipant()),
    )
  })

  it('refuse un bénéficiaire suivi en double', () => {
    expect(
      participantsDeLAtelier({
        suivis: [beneficiaire, beneficiaire],
        anonymes,
      }),
    ).toEqual(failure(BeneficiaireEnDouble()))
  })

  it('accepte un bénéficiaire suivi seul', () => {
    expect(
      participantsDeLAtelier({ suivis: [beneficiaire], anonymes }),
    ).toEqual(success({ suivis: [beneficiaire], anonymes }))
  })
})
