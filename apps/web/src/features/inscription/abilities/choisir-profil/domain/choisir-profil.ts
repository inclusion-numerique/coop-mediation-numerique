import {
  type GetInscriptionEtat,
  InscriptionDejaValidee,
  InscriptionIntrouvable,
  isValidee,
  type ProfilInscription,
  poserProfil,
  type UserId,
} from '@app/web/features/inscription/domain'
import { failure, type Result, success } from '@app/web/libraries/result'
import type { EnregistrerProfilChoisi } from './ports'
import { rolesACreerPourProfil } from './roles-a-creer'

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

export type ChoisirProfilError = InscriptionIntrouvable | InscriptionDejaValidee

/**
 * Choisit — ou re-choisit — le profil d'inscription : lit l'état courant,
 * applique la transition, puis persiste l'état résultant et les comptes de rôle
 * en une écriture. Orchestration pure sur les ports injectés : les colonnes
 * d'inscription ne sont jamais écrites autrement que via un état du domaine.
 */
export const choisirProfil =
  (deps: {
    readonly getInscriptionEtat: GetInscriptionEtat
    readonly enregistrerProfilChoisi: EnregistrerProfilChoisi
    readonly maintenant: Date
  }) =>
  async ({
    userId,
    profil,
  }: ProfilChoisi): Promise<
    Result<{ readonly profil: ProfilInscription }, ChoisirProfilError>
  > => {
    const etat = await deps.getInscriptionEtat(userId)

    if (etat === null) return failure(InscriptionIntrouvable(userId))
    if (isValidee(etat)) return failure(InscriptionDejaValidee(userId))

    await deps.enregistrerProfilChoisi({
      etat: poserProfil(etat, profil, deps.maintenant),
      roles: rolesACreerPourProfil(profil),
    })

    return success({ profil })
  }
