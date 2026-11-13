import { type Result, success } from '@app/web/libraries/result'
import {
  type ActiviteDeCoordination,
  type ActiviteDeCoordinationId,
  type Animation,
  type CoordinateurId,
  type DateTropLointaine,
  dateDActiviteBornee,
  dateDActiviteDuJour,
  type Evenement,
  type Partenariat,
  type TagDeLActivite,
  type TagId,
} from '../../../domain'

type SaisieDe<Activite> = Omit<
  Activite,
  'id' | 'coordinateurId' | 'tags' | 'creation' | 'modification'
> & {
  readonly id: ActiviteDeCoordinationId | null
  readonly tags: readonly TagId[]
}

export type SaisieDeCoordination =
  | SaisieDe<Animation>
  | SaisieDe<Evenement>
  | SaisieDe<Partenariat>

export type ActiviteEnregistree = {
  readonly id: ActiviteDeCoordinationId
  readonly type: ActiviteDeCoordination['_tag']
}

export const activiteDeLaSaisie = ({
  saisie,
  id,
  coordinateurId,
  tags,
  creation,
  maintenant,
}: {
  readonly saisie: SaisieDeCoordination
  readonly id: ActiviteDeCoordinationId
  readonly coordinateurId: CoordinateurId
  readonly tags: readonly TagDeLActivite[]
  readonly creation: Date
  readonly maintenant: Date
}): Result<ActiviteDeCoordination, DateTropLointaine> => {
  const date = dateDActiviteBornee(saisie.date, dateDActiviteDuJour(maintenant))
  if (!date.success) return date
  return success({
    ...saisie,
    id,
    coordinateurId,
    date: date.data,
    tags,
    creation,
    modification: maintenant,
  })
}
