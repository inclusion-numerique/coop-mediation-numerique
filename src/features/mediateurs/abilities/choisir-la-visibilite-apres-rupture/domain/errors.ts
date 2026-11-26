import type {
  MediateurId,
  MediateurIntrouvable,
} from '@/features/mediateurs/domain'

export type AucuneRuptureEnAttente = {
  readonly _tag: 'AucuneRuptureEnAttente'
  readonly mediateurId: MediateurId
}

export const AucuneRuptureEnAttente = (
  mediateurId: MediateurId,
): AucuneRuptureEnAttente => ({ _tag: 'AucuneRuptureEnAttente', mediateurId })

export type EchecDeChoisirLaVisibiliteApresRupture =
  | MediateurIntrouvable
  | AucuneRuptureEnAttente

export type EchecDeConsulterLaRuptureEnAttente =
  | MediateurIntrouvable
  | AucuneRuptureEnAttente
