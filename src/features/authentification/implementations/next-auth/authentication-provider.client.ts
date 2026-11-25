import { environnementServeur } from '@/configuration/environnement/serveur'
import {
  branche,
  estDev,
  estLocal,
  estMain,
  estPreview,
} from '@/configuration/projet'
import { proConnectProviderId } from '../../domain/fournisseur-proconnect'

/**
 * Depending on the environment we have a different provider configuration
 */
export const authenticationViaProconnect =
  estLocal() || environnementServeur().IS_E2E || estMain() || estDev()

export const moyenDeConnexion = authenticationViaProconnect
  ? ({ via: 'proconnect', fournisseur: proConnectProviderId } as const)
  : ({
      via: 'courriel',
      branchePreview: estPreview() ? branche() : null,
    } as const)
