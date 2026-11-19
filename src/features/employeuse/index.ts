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

export { employeuseConsulteeAffichage } from './abilities/consulter-employeuse/ui/employeuse-consultee.presenter'

export { emploiEmployeuseAffichage } from './abilities/consulter-employeuse-a-une-date/ui/employeuse-emploi.presenter'

export { employeuseActuelleAffichage } from './abilities/consulter-employeuse-actuelle/ui/employeuse-actuelle.presenter'

export { historiqueEmployeusesAffichage } from './abilities/consulter-historique-employeuses/ui/historique-employeuses.presenter'

export { employeuseAffichee } from './abilities/lister-employeuses/ui/employeuse-affichee.presenter'
export {
  criteresListeEmployeuses,
  type EmployeusesSearchParams,
  etatDeTableEmployeuses,
} from './abilities/lister-employeuses/ui/lister-employeuses-search-params'

export {
  ContactReferent,
  contratLePlusRecent,
  contratPourEmployeuse,
  EmployeuseId,
  IdentiteEmployeuse,
  referentAffichage,
} from './domain'
export { employeuseAffichage } from './ui/employeuse.presenter'
