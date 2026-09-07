import type { LieuId } from '@app/web/features/lieux-activite/domain/lieu-id'

/**
 * Ce qu'il faut savoir d'un lieu pour juger son SIRET.
 *
 * Le SIRET reste une chaîne : cette ability existe précisément parce qu'on
 * doute de ces numéros. Les brander « SIRET valide » à la lecture affirmerait
 * ce que la vérification est chargée d'établir.
 */
export type LieuAVerifier = {
  readonly id: LieuId
  readonly siret: string
  readonly nom: string
  readonly adresse: string
  /** Date de la dernière confrontation à SIRENE, `null` si jamais confronté. */
  readonly synchronisation: Date | null
}

/**
 * Ce que l'annuaire des entreprises est autorisé à dire au domaine : sous quel
 * nom et à quelle adresse le SIRET est enregistré, ou rien du tout.
 *
 * Un SIRET peut être « inconnu » de plusieurs façons — absent du répertoire,
 * rattaché à une personne physique, porté par un établissement fermé. Aucune
 * ne change ce qu'on en fait, donc aucune n'entre ici.
 */
export type ReponseSirene =
  | { readonly connu: true; readonly nom: string; readonly adresse: string }
  | { readonly connu: false }
