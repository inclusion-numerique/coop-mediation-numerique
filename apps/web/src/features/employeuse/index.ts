/**
 * API publique CLIENT-SAFE de la feature employeuse.
 *
 * La coop n'est plus propriétaire des structures employeuses (ADR-002) : elle
 * les lit dans `main.structure_administrative`, via la personne et ses
 * affectations actives. Tout ce qui touche à l'employeuse passe par ici ou par
 * `./server` — les autres features n'atteignent ni son `domain/` ni son `db/`.
 *
 * Ce barrel ne contient QUE ce qui peut vivre dans un bundle navigateur :
 * domaine, mises à plat d'affichage, types. Aucune implémentation Prisma, aucun
 * fragment SQL. Les exports qui lisent la base vivent dans `./server`, sous
 * garde `server-only`.
 *
 * Raison d'être : un composant client qui importait ce barrel embarquait le
 * client Prisma et faisait répondre la page en 500
 * (« Extensions.defineExtension is unable to run in this browser environment »).
 * Ni `tsc` ni le build ne voient ce chemin. La séparation rend la faute
 * impossible plutôt que détectable.
 *
 * Les réexports pointent les modules de presenter et de domaine DIRECTEMENT, et
 * jamais l'`index.ts` d'une ability : celui-ci réexporte son implémentation, et
 * suffirait à ramener Prisma ici.
 */

export type {
  ConsulterEmployeuse,
  EmployeuseConsultee,
  PersonneEmployee,
} from './abilities/consulter-employeuse/domain'
export {
  type EmployeuseConsulteeAffichage,
  employeuseConsulteeAffichage,
} from './abilities/consulter-employeuse/ui/employeuse-consultee.presenter'
export type { ConsulterEmployeuseAUneDate } from './abilities/consulter-employeuse-a-une-date/domain'
export {
  type EmploiEmployeuseAffichage,
  emploiEmployeuseAffichage,
} from './abilities/consulter-employeuse-a-une-date/ui/employeuse-emploi.presenter'
export type { ConsulterEmployeuseActuelle } from './abilities/consulter-employeuse-actuelle/domain'
export {
  type EmployeuseActuelleAffichage,
  employeuseActuelleAffichage,
  employeuseSessionEmplois,
} from './abilities/consulter-employeuse-actuelle/ui/employeuse-actuelle.presenter'
export type { ConsulterHistoriqueEmployeuses } from './abilities/consulter-historique-employeuses/domain'
export {
  type EmployeuseHistoriqueAffichage,
  historiqueEmployeusesAffichage,
} from './abilities/consulter-historique-employeuses/ui/historique-employeuses.presenter'
export type {
  CriteresListeEmployeuses,
  EmployeuseListee,
} from './abilities/lister-employeuses/domain'
export {
  type EmployeuseAffichee,
  employeuseAffichee,
} from './abilities/lister-employeuses/ui/employeuse-affichee.presenter'
export type { EmployeusesSearchParams } from './abilities/lister-employeuses/ui/employeuses.data-table'
export type {
  RattachementEmployeuse,
  RattacherAUneEmployeuse,
  RattacherAUneEmployeuseDepuisSiret,
} from './abilities/rattacher-a-une-employeuse/domain'
export type { RechercherEmployeuse } from './abilities/rechercher-employeuse/domain'
export {
  type EmployeuseRecherchee,
  employeuseRecherchee,
} from './abilities/rechercher-employeuse/ui/employeuse-recherchee.presenter'
// `employeuse.transfer` n'importe `Prisma` qu'en TYPE : il est effacé à la
// compilation et ne ramène donc pas le client dans le bundle.
export {
  conseillerNumeriqueWhere,
  type PersonneConseillerNumeriquePayload,
  type PersonneEmployeusePayload,
  personneConseillerNumeriqueSelect,
  personneEmployeuseSelect,
  personneEstConseillerNumerique,
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
  EmployeuseId,
  employeuseALaDate,
  employeuseCodeInsee,
  estConseillerNumerique,
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
