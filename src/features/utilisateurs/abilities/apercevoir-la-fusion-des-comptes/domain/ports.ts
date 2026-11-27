import type { UtilisateurId } from '@/features/utilisateurs/domain'
import type { CompteApercu } from './apercu-de-fusion'

export type LireLesComptesAApercevoir = (ids: {
  readonly sourceId: UtilisateurId
  readonly cibleId: UtilisateurId
}) => Promise<{
  readonly source: CompteApercu | null
  readonly cible: CompteApercu | null
}>

export type ApercevoirLaFusionDesComptesPorts = {
  readonly lireLesComptesAApercevoir: LireLesComptesAApercevoir
}
