import type { MediateurId } from '../../../domain/identifiants/mediateur-id'
import type { RattachementId } from '../../../domain/identifiants/rattachement-id'
import type { UtilisateurId } from '../../../domain/identifiants/utilisateur-id'

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

export type AvisDeRetrait = {
  readonly mediateurEmail: string
  readonly mediateurFirstname: string | null
  readonly structureNom: string
  readonly removedByName: string
}

export type FinDuRattachement = {
  readonly id: RattachementId
  readonly par: UtilisateurId
  readonly maintenant: Date
}

export type RetraitDuLieu = {
  readonly fin: FinDuRattachement
  readonly avis: AvisDeRetrait | null
}
