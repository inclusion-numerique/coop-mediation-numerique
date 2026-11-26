import type { AdresseCourriel } from '@/features/utilisateurs/domain'
import type {
  CibleFusionId,
  CompteAFusionner,
  FusionAutorisee,
  SourceFusionId,
} from './compte-a-fusionner'

export type LireLesComptesAFusionner = (ids: {
  readonly sourceId: string
  readonly cibleId: string
}) => Promise<{
  readonly source: CompteAFusionner<SourceFusionId> | null
  readonly cible: CompteAFusionner<CibleFusionId> | null
}>

export type Fusionner = (fusion: FusionAutorisee) => Promise<void>

export type RetirerLaSourceDesListes = (
  courriel: AdresseCourriel,
) => Promise<void>

export type FusionnerDesComptesPorts = {
  readonly lireLesComptesAFusionner: LireLesComptesAFusionner
  readonly fusionner: Fusionner
  readonly retirerLaSourceDesListes: RetirerLaSourceDesListes
}
