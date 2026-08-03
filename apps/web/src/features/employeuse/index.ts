/**
 * API publique de la feature employeuse.
 *
 * La coop n'est plus propriétaire des structures employeuses (ADR-002) : elle
 * les lit dans `main.structure_administrative`, via la personne et ses
 * affectations actives. Tout ce qui touche à l'employeuse passe par ici — les
 * autres features n'atteignent ni son `domain/` ni son `db/`.
 *
 * Deux voies de lecture, selon le contexte :
 * - `consulterEmployeuseActuelle({ userId })` — lecture autonome, un utilisateur ;
 * - `personneEmployeuseSelect` + `personneToEmployeuseActuelle` — composition,
 *   pour les requêtes de liste qui ne peuvent pas se permettre une requête par
 *   utilisateur.
 */
export {
  type ConsulterEmployeuseActuelle,
  consulterEmployeuseActuelle,
  type EmployeuseActuelleAffichage,
  employeuseActuelleAffichage,
  employeuseSessionEmplois,
} from './abilities/consulter-employeuse-actuelle'
export {
  type PersonneEmployeusePayload,
  personneEmployeuseSelect,
  personneToEmployeuseActuelle,
} from './db/employeuse.transfer'
export {
  type AdresseEmployeuse,
  type Affectation,
  type CodeInsee,
  ContactReferent,
  type Contrat,
  type CourrielReferent,
  contratPourEmployeuse,
  type DenominationEmployeuse,
  debutEmploi,
  type Employeuse,
  type EmployeuseActuelle,
  type EmployeuseId,
  employeuseCodeInsee,
  finEmploi,
  type PeriodeEmploi,
  type Rna,
  referentAffichage,
  type Siret,
  type SourceAffectation,
} from './domain'
