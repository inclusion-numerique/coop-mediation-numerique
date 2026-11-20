import type { CompteRdv } from '@/features/rdvsp/domain/compte-rdv'
import {
  peutEtreSynchronise,
  santeDuCompte,
} from '@/features/rdvsp/domain/sante-compte'
import type { UtilisateurCoopId } from '@/features/rdvsp/domain/utilisateur-coop-id'

export type EchecDeSynchronisation = {
  readonly utilisateurId: UtilisateurCoopId
  readonly raison: string
}

export type BilanDeSynchronisation = {
  readonly comptes: number
  readonly eligibles: number
  readonly synchronises: number
  readonly echecs: readonly EchecDeSynchronisation[]
}

export const comptesEligibles = (
  comptes: readonly CompteRdv[],
  maintenant: Date,
): readonly CompteRdv[] =>
  comptes.filter((compte) =>
    peutEtreSynchronise(santeDuCompte(compte, maintenant)),
  )
