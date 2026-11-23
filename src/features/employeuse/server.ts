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
 * Le composant de page n'est PAS réexporté ici : y mêler du React entraîne ses
 * feuilles de style dans des contextes qui ne savent pas les lire. La route
 * l'importe directement depuis l'ability.
 */

export {
  consulterEmployeuse,
  nomDeLEmployeuse,
} from './abilities/consulter-employeuse/implementations'
export { consulterEmployeuseAUneDate } from './abilities/consulter-employeuse-a-une-date/implementations'
export { consulterEmployeuseActuelle } from './abilities/consulter-employeuse-actuelle/implementations'
export { consulterHistoriqueEmployeuses } from './abilities/consulter-historique-employeuses/implementations'
export { listerEmployeuses } from './abilities/lister-employeuses/implementations'

export {
  rattacherAUneEmployeuseBinding,
  rattacherAUneEmployeuseDepuisSiretBinding,
  rattacherAUneEmployeuseSaisieBinding,
} from './abilities/rattacher-a-une-employeuse/implementations/rattacher-a-une-employeuse.binding'
export {
  communesDesEmployeuses,
  rechercherDesCommunesDesEmployeuses,
  rechercherEmployeuse,
} from './abilities/rechercher-employeuse/implementations'
export * from './index'
