import type { User as PrismaUser } from '@prisma/client'
import { dateDeFranchissement, Franchissement } from '../domain/franchissement'
import type { InscriptionEtat } from '../domain/inscription-etat'
import {
  computeUserProfile,
  ProfilInscription,
} from '../domain/profil-inscription'
import { Role } from '../domain/role'
import { UserId } from '../domain/user-id'

type InscriptionRow = Pick<
  PrismaUser,
  | 'id'
  | 'profilInscription'
  | 'isConseillerNumerique'
  | 'acceptationCgu'
  | 'structureEmployeuseRenseignee'
  | 'lieuxActiviteRenseignes'
  | 'inscriptionValidee'
>

const toProgression = (row: InscriptionRow) => ({
  structureEmployeuse: Franchissement(row.structureEmployeuseRenseignee),
  lieuxActivite: Franchissement(row.lieuxActiviteRenseignes),
})

/**
 * Rôle de base extrait du profil legacy 4-valeurs : les variantes conseiller
 * numérique retombent sur leur rôle (le statut CN vit dans le booléen dédié).
 */
const roleDepuisProfil = (profil: ProfilInscription): Role =>
  Role(
    profil === 'Coordinateur' || profil === 'CoordinateurConseillerNumerique'
      ? 'Coordinateur'
      : 'Mediateur',
  )

/**
 * Reconstruit l'état depuis la ligne `user`. Le rôle vient du profil legacy
 * (collapsé), le statut CN de son booléen dédié (source de vérité Dataspace).
 * Garde conservatrice : sans profil ET CGU posés ensemble, l'inscription est
 * `NonDemarree`.
 */
export const inscriptionEtatToDomain = (
  row: InscriptionRow,
): InscriptionEtat => {
  if (row.profilInscription === null || row.acceptationCgu === null)
    return { _tag: 'NonDemarree', userId: UserId(row.id) }

  const ouvert = {
    userId: UserId(row.id),
    role: roleDepuisProfil(ProfilInscription(row.profilInscription)),
    conseillerNumerique: row.isConseillerNumerique,
    acceptationCgu: row.acceptationCgu,
    progression: toProgression(row),
  }

  return row.inscriptionValidee === null
    ? { _tag: 'EnCours', ...ouvert }
    : { _tag: 'Validee', ...ouvert, inscriptionValidee: row.inscriptionValidee }
}

/**
 * Projette l'état vers les colonnes `user`. Le profil legacy 4-valeurs est
 * *re-aplati* depuis (rôle, statut CN) pour rester lisible par le legacy, le
 * booléen CN étant écrit en parallèle. Un CN qui traverse une étape conserve
 * donc sa variante d'enum.
 */
export const inscriptionEtatFromDomain = (
  etat: InscriptionEtat,
): Pick<
  PrismaUser,
  | 'profilInscription'
  | 'isConseillerNumerique'
  | 'acceptationCgu'
  | 'structureEmployeuseRenseignee'
  | 'lieuxActiviteRenseignes'
  | 'inscriptionValidee'
> =>
  etat._tag === 'NonDemarree'
    ? {
        profilInscription: null,
        isConseillerNumerique: false,
        acceptationCgu: null,
        structureEmployeuseRenseignee: null,
        lieuxActiviteRenseignes: null,
        inscriptionValidee: null,
      }
    : {
        profilInscription: computeUserProfile({
          isConseillerNumerique: etat.conseillerNumerique,
          aCoordinateur: etat.role === 'Coordinateur',
        }),
        isConseillerNumerique: etat.conseillerNumerique,
        acceptationCgu: etat.acceptationCgu,
        structureEmployeuseRenseignee: dateDeFranchissement(
          etat.progression.structureEmployeuse,
        ),
        lieuxActiviteRenseignes: dateDeFranchissement(
          etat.progression.lieuxActivite,
        ),
        inscriptionValidee:
          etat._tag === 'Validee' ? etat.inscriptionValidee : null,
      }
