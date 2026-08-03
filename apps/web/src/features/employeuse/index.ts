/**
 * API publique de la feature employeuse.
 *
 * La coop n'est plus propriétaire des structures employeuses (ADR-002) : elle
 * les lit dans `main.structure_administrative`, via la personne et ses
 * affectations actives. Tout ce qui touche à l'employeuse passe par ici — les
 * autres features n'atteignent ni son `domain/` ni son `db/`.
 *
 * Deux questions, deux abilities : l'employeuse courante d'un utilisateur, et
 * son employeuse à une date donnée (pour les écrits rétro-datés).
 *
 * Deux voies de lecture, selon le contexte :
 * - les abilities `consulter…({ userId })` — lecture autonome, un utilisateur ;
 * - `personneEmployeuseSelect` + `personneToEmployeuse…` — composition, pour les
 *   requêtes de liste qui ne peuvent pas se permettre une requête par utilisateur.
 */

export {
  type ConsulterEmployeuseAUneDate,
  consulterEmployeuseAUneDate,
  type EmploiEmployeuseAffichage,
  emploiEmployeuseAffichage,
} from './abilities/consulter-employeuse-a-une-date'
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
  personneToEmployeuseALaDate,
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
  employeuseALaDate,
  employeuseCodeInsee,
  finEmploi,
  type PeriodeEmploi,
  type Rna,
  referentAffichage,
  type Siret,
  type SourceAffectation,
} from './domain'
export {
  type EmployeuseAffichage,
  employeuseAffichage,
} from './ui/employeuse.presenter'
