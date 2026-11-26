import type { MediateurId } from '@/features/mediateurs/domain'
import type { ChoixApresRupture } from './choix-apres-rupture'
import type { Contrat } from './rupture-en-attente'

export type MediateurEtContrats = {
  readonly id: MediateurId
  readonly visibiliteChoisieLe: Date | null
  readonly contrats: readonly Contrat[]
}

export type LireMediateurEtContrats = (
  mediateurId: MediateurId,
) => Promise<MediateurEtContrats | null>

export type EnregistrerLeChoix = (
  choix: ChoixApresRupture,
) => Promise<{ readonly enregistre: boolean }>

export type ChoisirLaVisibiliteApresRupturePorts = {
  readonly lireMediateurEtContrats: LireMediateurEtContrats
  readonly enregistrer: EnregistrerLeChoix
}

export type ConsulterLaRuptureEnAttentePorts = {
  readonly lireMediateurEtContrats: LireMediateurEtContrats
}
