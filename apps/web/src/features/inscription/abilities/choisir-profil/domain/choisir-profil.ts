import type { ProfilInscription } from '@app/web/features/inscription/domain/profil-inscription'
import type { UserId } from '@app/web/features/inscription/domain/user-id'

/**
 * Profils choisissables à la première étape : les variantes « conseiller
 * numérique » ne se choisissent pas, elles proviennent du Dataspace.
 */
export const profilsDisponibles = ['Mediateur', 'Coordinateur'] as const

export type ProfilsDisponibles = (typeof profilsDisponibles)[number]

export type ProfilChoisi = {
  readonly userId: UserId
  readonly profil: ProfilInscription
}

/** Comptes de rôle à garantir selon le profil choisi. */
export type RolesACreer = {
  readonly mediateur: boolean
  readonly coordinateur: boolean
}

/**
 * Règle métier pure : un profil médiation garantit un compte médiateur, un
 * profil coordination un compte coordinateur. Couvre les 4 valeurs (les profils
 * conseiller numérique inclus) même si seules deux sont choisissables ici.
 */
export const rolesACreerPourProfil = (
  profil: ProfilInscription,
): RolesACreer => ({
  mediateur: profil === 'Mediateur' || profil === 'ConseillerNumerique',
  coordinateur:
    profil === 'Coordinateur' || profil === 'CoordinateurConseillerNumerique',
})

export type ChoisirProfil = (
  input: ProfilChoisi,
) => Promise<{ readonly profil: ProfilInscription }>
