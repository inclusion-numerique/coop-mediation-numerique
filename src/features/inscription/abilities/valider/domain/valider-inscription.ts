import {
  InscriptionDejaValidee,
  ProfilNonChoisi,
  type UtilisateurId,
} from '@/features/inscription/domain'
import {
  type EchecTechnique,
  failure,
  type Result,
  success,
} from '@/libraries/result'
import { CompteDeRoleIntrouvable, type EchecDeValider } from './errors'

export type FaitsInscription = {
  readonly userId: UtilisateurId
  readonly profilChoisi: boolean
  readonly compteDeRoleExiste: boolean
  readonly dejaValidee: boolean
  readonly cguDejaAcceptee: boolean
}

export type ValidationAEnregistrer = {
  readonly userId: UtilisateurId
  readonly inscriptionValidee: Date
  readonly cguAPoser: Date | null
}

export type AcceptationDesInvitations =
  | { readonly _tag: 'InvitationsAcceptees' }
  | { readonly _tag: 'AcceptationEchouee'; readonly echec: EchecTechnique }

export type InscriptionValidee<Inscription> = ValidationAEnregistrer & {
  readonly inscriptionALaListe: Inscription
  readonly acceptationDesInvitations: AcceptationDesInvitations
}

export const acceptationDesInvitations = (
  acceptation: Result<void, EchecTechnique>,
): AcceptationDesInvitations =>
  acceptation.success
    ? { _tag: 'InvitationsAcceptees' }
    : { _tag: 'AcceptationEchouee', echec: acceptation.error }

export const validerInscription = ({
  faits: {
    userId,
    profilChoisi,
    compteDeRoleExiste,
    dejaValidee,
    cguDejaAcceptee,
  },
  maintenant,
}: {
  readonly faits: FaitsInscription
  readonly maintenant: Date
}): Result<ValidationAEnregistrer, EchecDeValider> => {
  if (!profilChoisi) return failure(ProfilNonChoisi(userId))
  if (dejaValidee) return failure(InscriptionDejaValidee(userId))
  if (!compteDeRoleExiste) return failure(CompteDeRoleIntrouvable(userId))

  return success({
    userId,
    inscriptionValidee: maintenant,
    cguAPoser: cguDejaAcceptee ? null : maintenant,
  })
}
