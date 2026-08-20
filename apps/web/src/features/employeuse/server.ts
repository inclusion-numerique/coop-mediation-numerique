// La garde qui donne son sens à la séparation : tout module atteint depuis un
// bundle navigateur et important ce barrel fait échouer la compilation, au lieu
// d'embarquer le client Prisma et de casser la page à l'exécution.
//
// `server-only` jette sous la condition `default` et n'est neutralisé qu'en
// `react-server`. Le CLI (jobs) tourne en Node pur : il l'alias vers un module
// vide via `paths` dans le tsconfig, ce qui désarme la garde là où elle n'a pas
// de sens — un job EST du serveur — sans rien changer à la résolution du reste.
import 'server-only'

/**
 * API publique SERVEUR de la feature employeuse.
 *
 * Réexporte tout le barrel client-safe, puis y ajoute ce qui lit la base :
 * abilities, implémentations Prisma et fragments SQL. Les appels serveur
 * (pages, server actions, jobs, steps Cucumber) n'ont donc qu'un seul import à
 * connaître.
 *
 * Deux voies de lecture, selon le contexte :
 * - les abilities `consulter…({ userId })` — lecture autonome, un utilisateur ;
 * - `personneEmployeuseSelect` + `personneToEmployeuse…` — composition, pour les
 *   requêtes de liste qui ne peuvent pas se permettre une requête par utilisateur.
 *
 * Le composant de page n'est PAS réexporté ici : y mêler du React entraîne ses
 * feuilles de style dans des contextes qui ne savent pas les lire. La route
 * l'importe directement depuis l'ability.
 */

export { consulterEmployeuse } from './abilities/consulter-employeuse/implementation'
export { consulterEmployeuseAUneDate } from './abilities/consulter-employeuse-a-une-date/implementation'
export { consulterEmployeuseActuelle } from './abilities/consulter-employeuse-actuelle/implementation'
export { consulterHistoriqueEmployeuses } from './abilities/consulter-historique-employeuses/implementation'
export { listerEmployeuses } from './abilities/lister-employeuses/implementation'
export {
  adresseMainKey,
  deactivateCoopAffectationsExcept,
  ensureAffectationEmploiMain,
  ensurePersonneMain,
  ensureStructureAdministrativeMain,
  findAdresseMainId,
  insertAdresseMain,
  rattacherAUneEmployeuse,
  rattacherAUneEmployeuseDepuisSiret,
  resolveAdresseMain,
  resolveIdentiteFromSiret,
} from './abilities/rattacher-a-une-employeuse/implementation'
export { rechercherEmployeuse } from './abilities/rechercher-employeuse/implementation'
export {
  conseillerNumeriqueExpression,
  conseillerNumeriqueSql,
  employeuseCourante,
  employeuseCouranteJoin,
} from './db/employeuse.sql'
export * from './index'
