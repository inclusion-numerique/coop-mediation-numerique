import type { User as PrismaUser } from '@/generated/prisma/client'
import type { InscriptionEtat } from '../../domain/etat-de-l-inscription'
import {
  dateDeFranchissement,
  Franchissement,
} from '../../domain/franchissement'
import {
  ProfilInscription,
  profilDInscription,
} from '../../domain/profil-inscription'
import { Role } from '../../domain/role'
import { UtilisateurId } from '../../domain/utilisateur-id'

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

const roleDepuisProfil = (profil: ProfilInscription): Role =>
  Role(
    profil === 'Coordinateur' || profil === 'CoordinateurConseillerNumerique'
      ? 'Coordinateur'
      : 'Mediateur',
  )

const conseillerNumeriqueDepuisProfil = (profil: ProfilInscription): boolean =>
  profil === 'ConseillerNumerique' ||
  profil === 'CoordinateurConseillerNumerique'

export const inscriptionEtatToDomain = (
  row: InscriptionRow,
): InscriptionEtat => {
  if (row.profilInscription === null)
    return { _tag: 'NonDemarree', userId: UtilisateurId(row.id) }

  const profil = ProfilInscription(row.profilInscription)

  const ouvert = {
    userId: UtilisateurId(row.id),
    role: roleDepuisProfil(profil),
    conseillerNumerique: conseillerNumeriqueDepuisProfil(profil),
    acceptationCgu: row.acceptationCgu,
    progression: toProgression(row),
  }

  return row.inscriptionValidee === null
    ? { _tag: 'EnCours', ...ouvert }
    : { _tag: 'Validee', ...ouvert, inscriptionValidee: row.inscriptionValidee }
}

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
        profilInscription: profilDInscription({
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
