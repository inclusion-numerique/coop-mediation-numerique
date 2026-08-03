import type { AdresseEmployeuse } from './adresse-employeuse'
import type { ContactReferent } from './contact-referent'
import type { DenominationEmployeuse } from './denomination-employeuse'
import type { EmployeuseId } from './employeuse-id'
import type { Rna } from './rna'
import type { Siret } from './siret'

/**
 * Une structure employeuse, telle que la coop la lit dans
 * `main.structure_administrative` — dont elle n'est plus propriétaire depuis
 * l'ADR-002 : elle la consulte, et n'en crée que par l'inscription.
 *
 * Ce qui est volontairement absent : `structure_coop_id`. C'était l'échafaudage
 * de corrélation du dual-write ; son dernier lecteur sur ce chemin était l'`id`
 * des emplois de session, que personne ne consomme. Il n'est donc plus ni
 * sélectionné ni transporté — un lecteur de moins avant l'échange final.
 */
export type Employeuse = {
  readonly id: EmployeuseId
  /** Nom d'affichage : l'antenne quand elle existe, sinon SIRENE. */
  readonly denomination: DenominationEmployeuse | null
  /** Dénomination SIRENE brute — `denomination` lui préfère celle de l'antenne. */
  readonly denominationSirene: DenominationEmployeuse | null
  readonly siret: Siret | null
  readonly rna: Rna | null
  readonly adresse: AdresseEmployeuse | null
  readonly contactReferent: ContactReferent
  // Horodatages système, non brandés (DM-1bis). `suppression` est le
  // soft-delete posé côté Entrepôt : la coop l'affiche, elle ne le pose pas.
  readonly creation: Date | null
  readonly modification: Date | null
  readonly suppression: Date | null
}

export const employeuseCodeInsee = (employeuse: Employeuse) =>
  employeuse.adresse?.codeInsee ?? null
