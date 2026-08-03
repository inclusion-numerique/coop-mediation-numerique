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
  type ConsulterHistoriqueEmployeuses,
  consulterHistoriqueEmployeuses,
  type EmployeuseHistoriqueAffichage,
  historiqueEmployeusesAffichage,
} from './abilities/consulter-historique-employeuses'
export {
  adresseMainKey,
  deactivateCoopAffectationsExcept,
  ensureAffectationEmploiMain,
  ensurePersonneMain,
  ensureStructureAdministrativeMain,
  findAdresseMainId,
  insertAdresseMain,
  type RattachementEmployeuse,
  type RattacherAUneEmployeuse,
  type RattacherAUneEmployeuseDepuisSiret,
  rattacherAUneEmployeuse,
  rattacherAUneEmployeuseDepuisSiret,
  resolveAdresseMain,
  resolveIdentiteFromSiret,
} from './abilities/rattacher-a-une-employeuse'
export {
  type PersonneEmployeusePayload,
  personneEmployeuseSelect,
  personneToEmployeuseActuelle,
  personneToEmployeuseALaDate,
  personneToEmployeusesHistorique,
} from './db/employeuse.transfer'
export {
  AdresseAGeocoder,
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
  type EmployeuseHistorique,
  type EmployeuseId,
  employeuseALaDate,
  employeuseCodeInsee,
  finEmploi,
  IdentiteEmployeuse,
  identiteDepuisEtablissement,
  type PeriodeEmploi,
  type Rna,
  referentAffichage,
  Siret,
  type SourceAffectation,
} from './domain'
export {
  type EmployeuseAffichage,
  employeuseAffichage,
} from './ui/employeuse.presenter'
