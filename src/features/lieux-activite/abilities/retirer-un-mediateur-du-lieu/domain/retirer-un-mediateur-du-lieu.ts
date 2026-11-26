import { failure, type Result, success } from '@/libraries/result'
import type { LieuId } from '../../../domain/identifiants/lieu-id'
import type { MediateurId } from '../../../domain/identifiants/mediateur-id'
import type { RattachementId } from '../../../domain/identifiants/rattachement-id'
import type { UtilisateurId } from '../../../domain/identifiants/utilisateur-id'
import type { EnvoyerLeRetraitDuLieu } from './envoi-du-retrait'
import {
  type EchecDeRetrait,
  PasEnActiviteSurCeLieu,
  RetraitNonAutorise,
} from './errors'
import { doitEtrePrevenu, peutRetirer, quiRetire } from './qui-retire'

export type AuteurDuRetrait = {
  readonly userId: UtilisateurId
  readonly mediateurId: MediateurId | null
  readonly estAdministrateur: boolean
  readonly coordonneLeMediateurRetire: boolean
  readonly nomAffiche: string
}

export type RattachementEnCours = {
  readonly id: RattachementId
  readonly nomDuLieu: string
  readonly emailDuMediateur: string
  readonly prenomDuMediateur: string | null
}

export type TrouverLeRattachementEnCours = (rattachement: {
  readonly mediateurId: MediateurId
  readonly lieuId: LieuId
}) => Promise<RattachementEnCours | null>

export type TerminerLeRattachement = (fin: {
  readonly id: RattachementId
  readonly par: UtilisateurId
  readonly maintenant: Date
}) => Promise<void>

export const retirerUnMediateurDuLieu =
  ({
    trouverLeRattachementEnCours,
    envoyerLeRetraitDuLieu,
    terminerLeRattachement,
  }: {
    readonly trouverLeRattachementEnCours: TrouverLeRattachementEnCours
    readonly envoyerLeRetraitDuLieu: EnvoyerLeRetraitDuLieu
    readonly terminerLeRattachement: TerminerLeRattachement
  }) =>
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
  }): Promise<Result<void, EchecDeRetrait>> => {
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

    if (doitEtrePrevenu(qui))
      await envoyerLeRetraitDuLieu({
        mediateurEmail: rattachement.emailDuMediateur,
        mediateurFirstname: rattachement.prenomDuMediateur,
        structureNom: rattachement.nomDuLieu,
        removedByName: auteur.nomAffiche,
      })

    await terminerLeRattachement({
      id: rattachement.id,
      par: auteur.userId,
      maintenant,
    })

    return success(undefined)
  }
