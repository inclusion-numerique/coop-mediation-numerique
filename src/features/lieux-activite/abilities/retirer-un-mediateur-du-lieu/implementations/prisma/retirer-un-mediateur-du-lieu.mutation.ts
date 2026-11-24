import { prismaClient } from '@/configuration/prisma/prisma-client'
import { envoyerLeRetraitDuLieu } from '@/features/lieux-activite/abilities/retirer-un-mediateur-du-lieu/implementations/email/envoyer-le-retrait-du-lieu.mutation'
import { failure, type Result, success } from '@/libraries/result'
import type { LieuId } from '../../../../domain/identifiants/lieu-id'
import type { MediateurId } from '../../../../domain/identifiants/mediateur-id'
import type { UtilisateurId } from '../../../../domain/identifiants/utilisateur-id'
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
  readonly userId: UtilisateurId
  readonly mediateurId: MediateurId | null
  readonly estAdministrateur: boolean
  readonly coordonneLeMediateurRetire: boolean
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
    coordonneLeMediateurRetire: auteur.coordonneLeMediateurRetire,
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
    await envoyerLeRetraitDuLieu({
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
