import { environnementServeur } from '@/configuration/environnement/serveur'
import { estDev, estLocal, estMain } from '@/configuration/projet/deploiement'

/**
 * Depending on the environment we have a different provider configuration
 */
export const authenticationViaProconnect =
  estLocal || environnementServeur.IS_E2E || estMain || estDev

export const authenticationViaEmailMagicLink = !authenticationViaProconnect
