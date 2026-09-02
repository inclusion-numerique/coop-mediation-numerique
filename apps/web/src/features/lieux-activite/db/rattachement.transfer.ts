import type { MediateurEnActivite } from '@prisma/client'
import { LieuId } from '../domain/lieu-id'
import { MediateurId } from '../domain/mediateur-id'
import type { Rattachement } from '../domain/rattachement'
import { RattachementId } from '../domain/rattachement-id'
import {
  ModificationInconnue,
  ModifieParUtilisateur,
  type TracabiliteRattachement,
} from '../domain/tracabilite'
import { UserId } from '../domain/user-id'

const toTracabilite = (row: MediateurEnActivite): TracabiliteRattachement => ({
  creation: {
    date: row.creation,
    par: row.creationParId == null ? null : UserId(row.creationParId),
  },
  derniereModification:
    row.derniereModificationParId == null
      ? ModificationInconnue(row.modification)
      : ModifieParUtilisateur(
          row.modification,
          UserId(row.derniereModificationParId),
        ),
})

/**
 * `fin` et `suppression` désignent un seul état. La suppression est examinée
 * d'abord : elle prime sur la fin d'activité, et discriminer sur `fin` rendrait
 * « en cours » une ligne supprimée à laquelle il manquerait la date de fin.
 */
export const rattachementToDomain = (
  row: MediateurEnActivite,
): Rattachement => {
  const base = {
    id: RattachementId(row.id),
    lieuId: LieuId(row.structureId),
    mediateurId: MediateurId(row.mediateurId),
    debut: row.debut,
    tracabilite: toTracabilite(row),
  }

  if (row.suppression != null)
    return {
      ...base,
      _tag: 'Supprime',
      suppression: row.suppression,
      supprimePar:
        row.suppressionParId == null ? null : UserId(row.suppressionParId),
      fin: row.fin,
    }

  return row.fin == null
    ? { ...base, _tag: 'EnCours' }
    : { ...base, _tag: 'Termine', fin: row.fin }
}

export const rattachementFromDomain = (rattachement: Rattachement) => ({
  id: rattachement.id,
  structureId: rattachement.lieuId,
  mediateurId: rattachement.mediateurId,
  debut: rattachement.debut,
  fin: rattachement._tag === 'EnCours' ? null : rattachement.fin,
  creation: rattachement.tracabilite.creation.date,
  creationParId: rattachement.tracabilite.creation.par,
  modification: rattachement.tracabilite.derniereModification.date,
  derniereModificationParId:
    rattachement.tracabilite.derniereModification._tag === 'ParUtilisateur'
      ? rattachement.tracabilite.derniereModification.par
      : null,
  suppression:
    rattachement._tag === 'Supprime' ? rattachement.suppression : null,
  suppressionParId:
    rattachement._tag === 'Supprime' ? rattachement.supprimePar : null,
})
