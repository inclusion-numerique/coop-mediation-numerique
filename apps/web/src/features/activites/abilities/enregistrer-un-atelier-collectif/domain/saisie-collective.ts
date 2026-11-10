import { type Result, success } from '@app/web/libraries/result'
import {
  type ActiviteId,
  type AtelierCollectif,
  type AtelierSansParticipant,
  type BeneficiaireEnDouble,
  type BeneficiaireId,
  type DateDActivite,
  type DateTropLointaine,
  type DureeEnMinutes,
  dateDActiviteBornee,
  dateDActiviteDuJour,
  type EmployeuseALaDate,
  type Equipement,
  type LieuSaisi,
  lieuDeLaSaisie,
  type MediateurId,
  type NiveauDAtelier,
  type Notes,
  type Origine,
  type ParticipantsAnonymes,
  participantsDeLAtelier,
  type RdvId,
  type TagId,
  type Thematiques,
  type TitreDAtelier,
} from '../../../domain'

export type SaisieCollective = {
  readonly id: ActiviteId | null
  readonly date: DateDActivite
  readonly duree: DureeEnMinutes
  readonly lieu: LieuSaisi
  readonly thematiques: Thematiques
  readonly equipement: Equipement
  readonly tags: readonly TagId[]
  readonly notes: Notes | null
  readonly rdvId: RdvId | null
  readonly titre: TitreDAtelier | null
  readonly niveau: NiveauDAtelier | null
  readonly suivis: readonly BeneficiaireId[]
  readonly anonymes: ParticipantsAnonymes
}

export type AtelierEnregistre = {
  readonly id: ActiviteId
  readonly type: 'Collectif'
}

export const atelierDeLaSaisie = ({
  saisie,
  id,
  mediateurId,
  employeuse,
  origine,
  creation,
  maintenant,
}: {
  readonly saisie: SaisieCollective
  readonly id: ActiviteId
  readonly mediateurId: MediateurId
  readonly employeuse: EmployeuseALaDate | null
  readonly origine: Origine
  readonly creation: Date
  readonly maintenant: Date
}): Result<
  AtelierCollectif,
  DateTropLointaine | AtelierSansParticipant | BeneficiaireEnDouble
> => {
  const date = dateDActiviteBornee(saisie.date, dateDActiviteDuJour(maintenant))
  if (!date.success) return date
  const participants = participantsDeLAtelier({
    suivis: saisie.suivis,
    anonymes: saisie.anonymes,
  })
  if (!participants.success) return participants
  return success({
    _tag: 'Collectif',
    id,
    mediateurId,
    date: date.data,
    duree: saisie.duree,
    lieu: lieuDeLaSaisie(saisie.lieu, employeuse),
    thematiques: saisie.thematiques,
    equipement: saisie.equipement,
    tags: saisie.tags,
    notes: saisie.notes,
    origine,
    employeuse: employeuse?.id ?? null,
    creation,
    modification: maintenant,
    titre: saisie.titre,
    niveau: saisie.niveau,
    participants: participants.data,
  })
}
