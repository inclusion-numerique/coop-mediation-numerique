import {
  InscriptionDejaValidee,
  ProfilNonChoisi,
  type UserId,
} from '@app/web/features/inscription/domain'
import { failure, type Result, success } from '@app/web/libraries/result'

/**
 * Un profil d'inscription est posé mais aucun compte de rôle (médiateur ou
 * coordinateur) n'existe en base : l'état fantôme né de l'incident des comptes
 * sans rôle, qu'on refuse de rendre validable.
 */
export type CompteDeRoleIntrouvable = {
  readonly _tag: 'CompteDeRoleIntrouvable'
  readonly userId: UserId
}

export const CompteDeRoleIntrouvable = (
  userId: UserId,
): CompteDeRoleIntrouvable => ({
  _tag: 'CompteDeRoleIntrouvable',
  userId,
})

/**
 * Faits d'inscription bruts requis par la validation. `valider` ne reconstruit
 * pas l'état `EnCours` : dans le flow Dataspace, c'est cette étape qui pose les
 * CGU (profil pré-rempli par le Dataspace, CGU encore absentes), un cas que
 * l'état `EnCours` — qui suppose les CGU déjà acceptées — ne modélise pas.
 */
export type FaitsInscription = {
  readonly userId: UserId
  readonly profilChoisi: boolean
  readonly compteDeRoleExiste: boolean
  readonly dejaValidee: boolean
  readonly cguDejaAcceptee: boolean
}

/**
 * Charge d'écriture décidée : la date de validation, et la date de CGU à poser
 * si elles n'avaient pas encore été acceptées (`null` = ne pas toucher à une
 * acceptation déjà posée).
 */
export type ValidationAEnregistrer = {
  readonly inscriptionValidee: Date
  readonly cguAPoser: Date | null
}

export type ValiderInscriptionError =
  | ProfilNonChoisi
  | InscriptionDejaValidee
  | CompteDeRoleIntrouvable

/**
 * Décide la validation de l'inscription à partir des faits bruts. Fonction pure :
 * la couche appelante lit les faits et projette `aEnregistrer`. Ordre des gardes :
 * profil choisi, puis idempotence (déjà validée), puis garde anti-compte-fantôme
 * — cette dernière ne concerne qu'une inscription pas encore validée.
 */
export const validerInscription = (
  {
    userId,
    profilChoisi,
    compteDeRoleExiste,
    dejaValidee,
    cguDejaAcceptee,
  }: FaitsInscription,
  maintenant: Date,
): Result<
  { aEnregistrer: ValidationAEnregistrer },
  ValiderInscriptionError
> => {
  if (!profilChoisi) return failure(ProfilNonChoisi(userId))
  if (dejaValidee) return failure(InscriptionDejaValidee(userId))
  if (!compteDeRoleExiste) return failure(CompteDeRoleIntrouvable(userId))

  return success({
    aEnregistrer: {
      inscriptionValidee: maintenant,
      cguAPoser: cguDejaAcceptee ? null : maintenant,
    },
  })
}
