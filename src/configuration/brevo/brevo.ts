import { environnementServeur } from '@/configuration/environnement/serveur'
import { estMain } from '@/configuration/projet'

export const brevoActif = () => estMain() && !environnementServeur().IS_E2E
