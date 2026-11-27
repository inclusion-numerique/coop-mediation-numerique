import type { CompteRdv } from '@/features/rdvsp/domain/compte/compte-rdv'
import {
  peutEtreSynchronise,
  santeDuCompte,
} from '@/features/rdvsp/domain/compte/sante-compte'
import type { UtilisateurCoopId } from '@/features/rdvsp/domain/identifiants/utilisateur-coop-id'

type CompteEnEchec = {
  readonly utilisateurId: UtilisateurCoopId
  readonly raison: string
}

export type BilanDeSynchronisation = {
  readonly comptes: number
  readonly eligibles: number
  readonly synchronises: readonly UtilisateurCoopId[]
  readonly echecs: readonly CompteEnEchec[]
}

export const comptesEligibles = (
  comptes: readonly CompteRdv[],
  maintenant: Date,
): readonly CompteRdv[] =>
  comptes.filter((compte) =>
    peutEtreSynchronise(santeDuCompte(compte, maintenant)),
  )
