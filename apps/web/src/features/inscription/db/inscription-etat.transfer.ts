import type { User as PrismaUser } from '@prisma/client'
import { dateDeFranchissement, Franchissement } from '../domain/franchissement'
import type {
  InscriptionEtat,
  ProgressionEtapes,
} from '../domain/inscription-etat'
import { ProfilInscription } from '../domain/profil-inscription'
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

const toProgression = (row: InscriptionRow): ProgressionEtapes => ({
  structureEmployeuse: Franchissement(row.structureEmployeuseRenseignee),
  lieuxActivite: Franchissement(row.lieuxActiviteRenseignes),
})

/**
 * Reconstruit l'état d'inscription depuis la ligne `user`. Garde conservatrice :
 * sans profil ET CGU posés ensemble, l'inscription est `NonDemarree` (une donnée
 * legacy incohérente ne fabrique pas un état `EnCours` bancal).
 */
export const inscriptionEtatToDomain = (
  row: InscriptionRow,
): InscriptionEtat => {
  if (row.profilInscription === null || row.acceptationCgu === null)
    return { _tag: 'NonDemarree', userId: UserId(row.id) }

  const ouvert = {
    userId: UserId(row.id),
    profil: ProfilInscription(row.profilInscription),
    acceptationCgu: row.acceptationCgu,
    progression: toProgression(row),
  }

  return row.inscriptionValidee === null
    ? { _tag: 'EnCours', ...ouvert }
    : { _tag: 'Validee', ...ouvert, inscriptionValidee: row.inscriptionValidee }
}

/**
 * Projette l'état d'inscription vers les colonnes `user`. Assignation naturelle
 * (les types brandés sont structurellement assignables), `null` pour les étapes
 * non franchies.
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
        profilInscription: etat.profil,
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
