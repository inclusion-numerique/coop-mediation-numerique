// Même garde que pour employeuse : tout module atteint depuis un bundle
// navigateur et important ce barrel fait échouer la compilation, au lieu
// d'embarquer le client Prisma et de casser la page à l'exécution.
import 'server-only'

/**
 * API publique SERVEUR de la feature inscription.
 *
 * `index.ts` n'expose que le domaine, donc rien de ce qui lit la base — et cette
 * absence de frontière serveur laissait les appelants extérieurs se faufiler par
 * chemin profond, jusque dans l'implémentation d'une ability. Les lectures que
 * d'autres features ont légitimement besoin de faire passent désormais par ici.
 *
 * Ce barrel reste volontairement étroit : on n'y ajoute que ce qui traverse
 * réellement la frontière de la feature. Ce que consomment les routes et les
 * server actions d'`app/` n'a pas à y figurer — `app/` n'est pas une feature et
 * compose ce qu'il veut.
 */
export { dispositifDepuisMain } from './abilities/initialiser-inscription/implementation/prisma/dispositif-depuis-main.query'
