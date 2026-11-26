import type { UtilisateurId } from '@/features/utilisateurs/domain'
import type { CibleUsurpation } from './usurpation'

export type LireLaCible = (
  utilisateurId: string,
) => Promise<CibleUsurpation | null>

export type OuvrirLUsurpation = (usurpation: {
  readonly jetonDeSession: string
  readonly cibleId: UtilisateurId
  readonly usurpateurId: string
}) => Promise<void>

export type UsurperUnUtilisateurPorts = {
  readonly lireLaCible: LireLaCible
  readonly ouvrirLUsurpation: OuvrirLUsurpation
}
