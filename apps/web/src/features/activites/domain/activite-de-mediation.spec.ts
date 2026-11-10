import { failure, success } from '@app/web/libraries/result'
import {
  aucuneParticipationAnonyme,
  equipementDe,
  participantsAnonymesDe,
  participantsDeLAtelier,
  thematiquesDe,
} from './activite-de-mediation'
import { BeneficiaireId } from './beneficiaire-id'
import {
  DateDActivite,
  dateDActiviteBornee,
  derniereDateDActivite,
} from './date-d-activite'
import { DureeEnMinutes } from './duree-en-minutes'
import { Effectif } from './effectif'
import {
  AtelierSansParticipant,
  AucuneThematique,
  AucunMaterielAvecMateriel,
  BeneficiaireEnDouble,
  DateTropLointaine,
  DejaAccompagnesExcedeLeTotal,
  MaterielEnDouble,
  RepartitionExcedeLeTotal,
  ThematiqueEnDouble,
  TropDeParticipantsAnonymes,
} from './errors'
import { Materiel } from './materiel'
import { ThematiqueAdministrative } from './thematique-administrative'
import { ThematiqueDeMediation } from './thematique-de-mediation'

const beneficiaire = BeneficiaireId('5b2d0c4e-8f1a-4c3b-9d7e-2a6f1b3c4d5e')

describe('date d’activité', () => {
  it('refuse une date antérieure au 17 novembre 2020', () => {
    expect(DateDActivite.safe('2020-11-16')).toBeNull()
  })

  it('refuse une date mal formée', () => {
    expect(DateDActivite.safe('0006-03-12T00:00')).toBeNull()
  })

  it('autorise une activité planifiée jusqu’à deux ans à l’avance', () => {
    expect(derniereDateDActivite(DateDActivite('2026-11-10'))).toBe(
      '2028-11-10',
    )
  })

  it('ramène un 29 février au 28 février deux ans plus tard, comme la base', () => {
    expect(derniereDateDActivite(DateDActivite('2028-02-29'))).toBe(
      '2030-02-28',
    )
  })

  it('accepte la dernière date autorisée', () => {
    expect(
      dateDActiviteBornee(
        DateDActivite('2028-11-10'),
        DateDActivite('2026-11-10'),
      ),
    ).toEqual(success('2028-11-10'))
  })

  it('refuse une date au-delà de deux ans', () => {
    expect(
      dateDActiviteBornee(
        DateDActivite('2525-01-01'),
        DateDActivite('2026-11-10'),
      ),
    ).toEqual(failure(DateTropLointaine(DateDActivite('2028-11-10'))))
  })
})

describe('durée', () => {
  it('ne dépasse pas 23 h 59', () => {
    expect(DureeEnMinutes.safe(1439)).toBe(1439)
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
    const resultat = participantsAnonymesDe(saisie)
    expect(resultat.success && resultat.data.genres).toEqual({
      masculin: 3,
      feminin: 5,
      nonCommunique: 2,
    })
    expect(resultat.success && resultat.data.tranchesDAge.nonCommunique).toBe(
      10,
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
  const sansAnonyme = participantsAnonymesDe(aucuneParticipationAnonyme)
  const anonymes = sansAnonyme.success ? sansAnonyme.data : null

  it('exige au moins un participant', () => {
    expect(
      anonymes && participantsDeLAtelier({ suivis: [], anonymes }),
    ).toEqual(failure(AtelierSansParticipant()))
  })

  it('refuse un bénéficiaire suivi en double', () => {
    expect(
      anonymes &&
        participantsDeLAtelier({
          suivis: [beneficiaire, beneficiaire],
          anonymes,
        }),
    ).toEqual(failure(BeneficiaireEnDouble()))
  })

  it('accepte un bénéficiaire suivi seul', () => {
    expect(
      anonymes && participantsDeLAtelier({ suivis: [beneficiaire], anonymes }),
    ).toEqual(success({ suivis: [beneficiaire], anonymes }))
  })
})
