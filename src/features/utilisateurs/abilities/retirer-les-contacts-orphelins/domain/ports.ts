import type {
  PortsDuRetraitDuContact,
  UtilisateurId,
} from '@/features/utilisateurs/domain'

export type InscritsVivantsParmi = (
  identifiants: readonly UtilisateurId[],
) => Promise<ReadonlySet<UtilisateurId>>

export type RetirerLesContactsOrphelinsPorts = PortsDuRetraitDuContact & {
  readonly inscritsVivantsParmi: InscritsVivantsParmi
}
