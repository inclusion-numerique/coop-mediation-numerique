import { type Result, success } from '@app/web/libraries/result'
import {
  type AccompagnementIndividuel,
  type ActiviteId,
  type Autonomie,
  type BeneficiaireAccompagne,
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
  type Notes,
  type Orientation,
  type Origine,
  type ProfilAnonyme,
  type RdvId,
  type TagId,
  type Thematiques,
} from '../../../domain'

export type BeneficiaireSaisi = {
  readonly id: BeneficiaireId | null
  readonly dejaAccompagne: boolean
  readonly profil: ProfilAnonyme
}

export type SaisieIndividuelle = {
  readonly id: ActiviteId | null
  readonly date: DateDActivite
  readonly duree: DureeEnMinutes
  readonly lieu: LieuSaisi
  readonly thematiques: Thematiques
  readonly equipement: Equipement
  readonly tags: readonly TagId[]
  readonly notes: Notes | null
  readonly rdvId: RdvId | null
  readonly beneficiaire: BeneficiaireSaisi
  readonly autonomie: Autonomie | null
  readonly orientation: Orientation
}

export type AccompagnementEnregistre = {
  readonly id: ActiviteId
  readonly type: 'Individuel'
}

export const beneficiaireAccompagneDe = (
  saisi: BeneficiaireSaisi,
  suivi: BeneficiaireId | null,
): BeneficiaireAccompagne =>
  suivi === null
    ? {
        _tag: 'Anonyme',
        dejaAccompagne: saisi.dejaAccompagne,
        profil: saisi.profil,
      }
    : { _tag: 'Suivi', id: suivi }

export const accompagnementDeLaSaisie = ({
  saisie,
  id,
  mediateurId,
  beneficiaire,
  employeuse,
  origine,
  creation,
  maintenant,
}: {
  readonly saisie: SaisieIndividuelle
  readonly id: ActiviteId
  readonly mediateurId: MediateurId
  readonly beneficiaire: BeneficiaireAccompagne
  readonly employeuse: EmployeuseALaDate | null
  readonly origine: Origine
  readonly creation: Date
  readonly maintenant: Date
}): Result<AccompagnementIndividuel, DateTropLointaine> => {
  const date = dateDActiviteBornee(saisie.date, dateDActiviteDuJour(maintenant))
  if (!date.success) return date
  return success({
    _tag: 'Individuel',
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
    beneficiaire,
    autonomie: saisie.autonomie,
    orientation: saisie.orientation,
  })
}
