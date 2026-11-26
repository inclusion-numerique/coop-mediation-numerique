import { environnementServeur } from '@/configuration/environnement/serveur'
import { estDev, estLocal, estMain } from './deploiement'

export const connexionParProConnect = (): boolean =>
  estLocal() || environnementServeur().IS_E2E || estMain() || estDev()
