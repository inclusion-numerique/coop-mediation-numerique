import { failure, type Result, success } from '@/libraries/result'
import type { LieuId } from '../../../domain/identifiants/lieu-id'
import type { MediateurId } from '../../../domain/identifiants/mediateur-id'
import {
  type EchecDeRetirerUnMediateurDuLieu,
  PasEnActiviteSurCeLieu,
  RetraitNonAutorise,
} from './errors'
import type { RetirerUnMediateurDuLieuPorts } from './ports'
import { doitEtrePrevenu, peutRetirer, quiRetire } from './qui-retire'
import type { AuteurDuRetrait, RetraitDuLieu } from './retrait-du-lieu'

export const retirerUnMediateurDuLieu =
  ({
    trouverLeRattachementEnCours,
    envoyerLeRetraitDuLieu,
    terminerLeRattachement,
  }: RetirerUnMediateurDuLieuPorts) =>
  async ({
    mediateurId,
    lieuId,
    auteur,
    maintenant,
  }: {
    readonly mediateurId: MediateurId
    readonly lieuId: LieuId
    readonly auteur: AuteurDuRetrait
    readonly maintenant: Date
  }): Promise<Result<RetraitDuLieu, EchecDeRetirerUnMediateurDuLieu>> => {
    const qui = quiRetire({
      mediateurRetire: mediateurId,
      mediateurDeLAuteur: auteur.mediateurId,
      estAdministrateur: auteur.estAdministrateur,
      coordonneLeMediateurRetire: auteur.coordonneLeMediateurRetire,
    })

    if (!peutRetirer(qui)) return failure(RetraitNonAutorise(mediateurId))

    const rattachement = await trouverLeRattachementEnCours({
      mediateurId,
      lieuId,
    })

    if (rattachement == null)
      return failure(PasEnActiviteSurCeLieu(mediateurId, lieuId))

    const retrait: RetraitDuLieu = {
      fin: { id: rattachement.id, par: auteur.userId, maintenant },
      avis: doitEtrePrevenu(qui)
        ? {
            mediateurEmail: rattachement.emailDuMediateur,
            mediateurFirstname: rattachement.prenomDuMediateur,
            structureNom: rattachement.nomDuLieu,
            removedByName: auteur.nomAffiche,
          }
        : null,
    }

    if (retrait.avis !== null) await envoyerLeRetraitDuLieu(retrait.avis)

    await terminerLeRattachement(retrait.fin)

    return success(retrait)
  }
