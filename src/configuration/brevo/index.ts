import { environnementServeur } from '@/configuration/environnement/serveur'
import { estMain } from '@/configuration/projet/deploiement'

export const brevoActif = () => estMain && !environnementServeur.IS_E2E
