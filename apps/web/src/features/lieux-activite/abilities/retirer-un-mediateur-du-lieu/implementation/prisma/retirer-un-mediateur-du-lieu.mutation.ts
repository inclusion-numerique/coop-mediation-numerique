import { failure, type Result, success } from '@app/web/libraries/result'
import { prismaClient } from '@app/web/prismaClient'
import { sendRemovedFromLieuEmail } from '@app/web/server/email/sendRemovedFromLieuEmail'
import type { LieuId } from '../../../../domain/lieu-id'
import type { MediateurId } from '../../../../domain/mediateur-id'
import type { UserId } from '../../../../domain/user-id'
import {
  type EchecDeRetrait,
  PasEnActiviteSurCeLieu,
  RetraitNonAutorise,
} from '../../domain/errors'
import {
  doitEtrePrevenu,
  peutRetirer,
  quiRetire,
} from '../../domain/qui-retire'

export type AuteurDuRetrait = {
  readonly userId: UserId
  readonly mediateurId: MediateurId | null
  readonly estAdministrateur: boolean
  readonly estCoordinateur: boolean
  readonly nomAffiche: string
}

export const retirerUnMediateurDuLieu = async ({
  mediateurId,
  lieuId,
  auteur,
  maintenant = new Date(),
}: {
  mediateurId: MediateurId
  lieuId: LieuId
  auteur: AuteurDuRetrait
  maintenant?: Date
}): Promise<Result<void, EchecDeRetrait>> => {
  const qui = quiRetire({
    mediateurRetire: mediateurId,
    mediateurDeLAuteur: auteur.mediateurId,
    estAdministrateur: auteur.estAdministrateur,
    estCoordinateur: auteur.estCoordinateur,
  })

  if (!peutRetirer(qui)) return failure(RetraitNonAutorise(mediateurId))

  const rattachement = await prismaClient.mediateurEnActivite.findFirst({
    where: { mediateurId, structureId: lieuId, fin: null, suppression: null },
    select: {
      id: true,
      lieuInclusion: { select: { nom: true } },
      mediateur: {
        select: { user: { select: { email: true, firstName: true } } },
      },
    },
  })

  if (rattachement == null)
    return failure(PasEnActiviteSurCeLieu(mediateurId, lieuId))

  if (doitEtrePrevenu(qui))
    await sendRemovedFromLieuEmail({
      mediateurEmail: rattachement.mediateur.user.email,
      mediateurFirstname: rattachement.mediateur.user.firstName,
      structureNom: rattachement.lieuInclusion.nom,
      removedByName: auteur.nomAffiche,
    })

  await prismaClient.mediateurEnActivite.update({
    where: { id: rattachement.id },
    data: {
      fin: maintenant,
      modification: maintenant,
      derniereModificationParId: auteur.userId,
    },
  })

  return success(undefined)
}
