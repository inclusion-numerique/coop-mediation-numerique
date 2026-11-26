import type {
  AdresseCourriel,
  EchecTechnique,
  UtilisateurId,
} from '@/features/utilisateurs/domain'
import type { Result } from '@/libraries/result'
import type { RetraitDeLaListe } from './contacts'

export type InscritsVivantsParmi = (
  identifiants: readonly UtilisateurId[],
) => Promise<ReadonlySet<UtilisateurId>>

export type SupprimerLeContact = (
  courriel: AdresseCourriel,
) => Promise<Result<void, EchecTechnique>>

export type RetirerLeContactDeLaListe = (
  courriel: AdresseCourriel,
) => Promise<Result<RetraitDeLaListe, EchecTechnique>>

export type RetirerLesContactsOrphelinsPorts = {
  readonly inscritsVivantsParmi: InscritsVivantsParmi
  readonly supprimerLeContact: SupprimerLeContact
  readonly retirerLeContactDeLaListe: RetirerLeContactDeLaListe
}
