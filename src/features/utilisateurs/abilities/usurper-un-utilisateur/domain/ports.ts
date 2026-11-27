import type { UtilisateurId } from '@/features/utilisateurs/domain'
import type { CibleUsurpation } from './usurpation'

type LireLaCible = (
  utilisateurId: UtilisateurId,
) => Promise<CibleUsurpation | null>

type OuvrirLUsurpation = (usurpation: {
  readonly jetonDeSession: string
  readonly cibleId: UtilisateurId
  readonly usurpateurId: UtilisateurId
}) => Promise<void>

export type UsurperUnUtilisateurPorts = {
  readonly lireLaCible: LireLaCible
  readonly ouvrirLUsurpation: OuvrirLUsurpation
}
