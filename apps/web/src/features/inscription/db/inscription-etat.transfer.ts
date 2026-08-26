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
 * Rôle de base extrait du profil 4-valeurs : les variantes conseiller numérique
 * retombent sur leur rôle.
 */
const roleDepuisProfil = (profil: ProfilInscription): Role =>
  Role(
    profil === 'Coordinateur' || profil === 'CoordinateurConseillerNumerique'
      ? 'Coordinateur'
      : 'Mediateur',
  )

/**
 * Statut conseiller numérique porté par le profil lui-même.
 *
 * Il vivait dans `coop.users.is_conseiller_numerique`, colonne supprimée depuis
 * que le dispositif se lit dans `main`. Le profil en est la projection fidèle —
 * `computeUserProfile` est la bijection inverse — donc rien n'est perdu à le
 * dériver plutôt qu'à le stocker une seconde fois.
 */
const conseillerNumeriqueDepuisProfil = (profil: ProfilInscription): boolean =>
  profil === 'ConseillerNumerique' ||
  profil === 'CoordinateurConseillerNumerique'

/**
 * Reconstruit l'état depuis la ligne `user`. Rôle et statut CN viennent tous
 * deux du profil (collapsé). C'est le *profil* qui démarre l'inscription : les
 * CGU sont un axe orthogonal (le parcours du dispositif pré-remplit le profil et
 * ne les recueille qu'au récapitulatif), et ne peuvent donc pas conditionner le
 * démarrage.
 */
export const inscriptionEtatToDomain = (
  row: InscriptionRow,
): InscriptionEtat => {
  if (row.profilInscription === null)
    return { _tag: 'NonDemarree', userId: UserId(row.id) }

  const profil = ProfilInscription(row.profilInscription)

  const ouvert = {
    userId: UserId(row.id),
    role: roleDepuisProfil(profil),
    conseillerNumerique: conseillerNumeriqueDepuisProfil(profil),
    acceptationCgu: row.acceptationCgu,
    progression: toProgression(row),
  }

  return row.inscriptionValidee === null
    ? { _tag: 'EnCours', ...ouvert }
    : { _tag: 'Validee', ...ouvert, inscriptionValidee: row.inscriptionValidee }
}

/**
 * Projette l'état vers les colonnes `user`. Le profil 4-valeurs est *re-aplati*
 * depuis (rôle, statut CN) : c'est désormais la seule colonne qui porte les
 * deux. Un CN qui traverse une étape conserve donc sa variante d'enum.
 */
export const inscriptionEtatFromDomain = (
  etat: InscriptionEtat,
): Pick<
  PrismaUser,
  | 'profilInscription'
  | 'acceptationCgu'
  | 'structureEmployeuseRenseignee'
  | 'lieuxActiviteRenseignes'
  | 'inscriptionValidee'
> =>
  etat._tag === 'NonDemarree'
    ? {
        profilInscription: null,
        acceptationCgu: null,
        structureEmployeuseRenseignee: null,
        lieuxActiviteRenseignes: null,
        inscriptionValidee: null,
      }
    : {
        profilInscription: computeUserProfile({
          isConseillerNumerique: etat.conseillerNumerique,
          isCoordinateur: etat.role === 'Coordinateur',
        }),
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
