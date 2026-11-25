import type { AdresseCourriel } from '@/features/utilisateurs/domain'
import type {
  CibleFusionId,
  CompteAFusionner,
  FusionAutorisee,
  SourceFusionId,
} from './compte-a-fusionner'

export type FusionnerDesComptesPorts = {
  readonly lireLesComptesAFusionner: (ids: {
    readonly sourceId: string
    readonly cibleId: string
  }) => Promise<{
    readonly source: CompteAFusionner<SourceFusionId> | null
    readonly cible: CompteAFusionner<CibleFusionId> | null
  }>
  readonly fusionner: (fusion: FusionAutorisee) => Promise<void>
  readonly retirerLaSourceDesListes: (
    courriel: AdresseCourriel,
  ) => Promise<void>
}
