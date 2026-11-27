import type { LireMediateurEtContrats } from '@/features/mediateurs/domain'
import type { ChoixApresRupture } from './choix-apres-rupture'

export type EnregistrerLeChoix = (
  choix: ChoixApresRupture,
) => Promise<{ readonly enregistre: boolean }>

export type ChoisirLaVisibiliteApresRupturePorts = {
  readonly lireMediateurEtContrats: LireMediateurEtContrats
  readonly enregistrer: EnregistrerLeChoix
}
