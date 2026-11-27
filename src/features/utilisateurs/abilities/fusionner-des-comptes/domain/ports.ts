import type {
  PortsDuRetraitDuContact,
  UtilisateurId,
} from '@/features/utilisateurs/domain'
import type { CompteApercu } from './apercu-de-fusion'
import type { CompteAFusionner, FusionAutorisee } from './compte-a-fusionner'

export type LireLesComptesAFusionner = (ids: {
  readonly sourceId: UtilisateurId
  readonly cibleId: UtilisateurId
}) => Promise<{
  readonly source: CompteAFusionner | null
  readonly cible: CompteAFusionner | null
}>

export type Fusionner = (fusion: FusionAutorisee) => Promise<void>

export type FusionnerDesComptesPorts = PortsDuRetraitDuContact & {
  readonly lireLesComptesAFusionner: LireLesComptesAFusionner
  readonly fusionner: Fusionner
}

export type LireLesComptesAApercevoir = (ids: {
  readonly sourceId: UtilisateurId
  readonly cibleId: UtilisateurId
}) => Promise<{
  readonly source: CompteApercu | null
  readonly cible: CompteApercu | null
}>

export type ApercevoirLaFusionPorts = {
  readonly lireLesComptesAApercevoir: LireLesComptesAApercevoir
}
