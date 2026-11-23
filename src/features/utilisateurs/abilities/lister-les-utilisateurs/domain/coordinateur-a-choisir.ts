import type { CoordinateurId, NomAffiche } from '@/features/utilisateurs/domain'

export type CoordinateurAChoisir = {
  readonly id: CoordinateurId
  readonly nomAffiche: NomAffiche
}
