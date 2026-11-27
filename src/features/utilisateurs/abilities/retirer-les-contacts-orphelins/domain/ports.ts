import type {
  AdresseCourriel,
  UtilisateurId,
} from '@/features/utilisateurs/domain'
import type { EchecTechnique, Result } from '@/libraries/result'
import type { PresenceDuContact, RetraitDeLaListe } from './contacts'

export type InscritsVivantsParmi = (
  identifiants: readonly UtilisateurId[],
) => Promise<ReadonlySet<UtilisateurId>>

export type SupprimerLeContact = (
  courriel: AdresseCourriel,
) => Promise<Result<void, EchecTechnique>>

export type RetirerLeContactDeLaListe = (
  courriel: AdresseCourriel,
) => Promise<Result<RetraitDeLaListe, EchecTechnique>>

export type LireLaPresenceDuContact = (
  courriel: AdresseCourriel,
) => Promise<Result<PresenceDuContact, EchecTechnique>>

export type RetirerLesContactsOrphelinsPorts = {
  readonly inscritsVivantsParmi: InscritsVivantsParmi
  readonly supprimerLeContact: SupprimerLeContact
  readonly retirerLeContactDeLaListe: RetirerLeContactDeLaListe
  readonly lireLaPresenceDuContact: LireLaPresenceDuContact
}
