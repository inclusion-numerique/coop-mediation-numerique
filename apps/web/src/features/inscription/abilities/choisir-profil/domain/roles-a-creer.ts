import type { ProfilInscription } from '@app/web/features/inscription/domain/profil-inscription'

/** Comptes de rôle à garantir selon le profil choisi. */
export type RolesACreer = {
  readonly mediateur: boolean
  readonly coordinateur: boolean
}

/**
 * Règle métier pure : un profil médiation garantit un compte médiateur, un
 * profil coordination un compte coordinateur. Couvre les 4 valeurs (les profils
 * conseiller numérique inclus) même si seules deux sont choisissables ici.
 *
 * Aucun profil ne rend les deux `false` : c'est ce qui autorise `valider` à ne
 * pas revérifier l'existence d'un compte de rôle.
 */
export const rolesACreerPourProfil = (
  profil: ProfilInscription,
): RolesACreer => ({
  mediateur: profil === 'Mediateur' || profil === 'ConseillerNumerique',
  coordinateur:
    profil === 'Coordinateur' || profil === 'CoordinateurConseillerNumerique',
})
