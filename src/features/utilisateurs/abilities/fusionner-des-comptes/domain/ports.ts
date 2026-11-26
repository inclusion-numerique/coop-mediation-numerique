import type {
  AdresseCourriel,
  UtilisateurId,
} from '@/features/utilisateurs/domain'
import type { CompteAFusionner, FusionAutorisee } from './compte-a-fusionner'

export type LireLesComptesAFusionner = (ids: {
  readonly sourceId: UtilisateurId
  readonly cibleId: UtilisateurId
}) => Promise<{
  readonly source: CompteAFusionner | null
  readonly cible: CompteAFusionner | null
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
