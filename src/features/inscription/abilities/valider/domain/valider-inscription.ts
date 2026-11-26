import {
  InscriptionDejaValidee,
  ProfilNonChoisi,
  type UtilisateurId,
} from '@/features/inscription/domain'
import { failure, type Result, success } from '@/libraries/result'
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

export type InscriptionValidee<Contact> = ValidationAEnregistrer & {
  readonly contactInscrit: Contact | null
}

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
