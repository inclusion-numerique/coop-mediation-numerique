import type { ProfilInscription } from '@/features/inscription/domain'
import type { MediateurId } from './mediateur-id'

export type InscritARecapituler = {
  readonly profil: ProfilInscription | null
  readonly mediateurId: MediateurId | null
  readonly aUnCompteCoordinateur: boolean
  readonly lieuxImportesLe: Date | null
}

export type Recapitulatif<Lieu> = {
  readonly lieuxActivite: readonly Lieu[]
  readonly nombreDeMediateursCoordonnes: number | null
  readonly lieuxImportesLe: Date | null
}
