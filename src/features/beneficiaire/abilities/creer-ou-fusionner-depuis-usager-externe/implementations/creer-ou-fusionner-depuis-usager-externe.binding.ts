import { communeDeLAdresse } from './ban/commune-de-l-adresse.query'
import { creerOuFusionnerBeneficiairesDepuisUsagersExternes } from './prisma/creer-ou-fusionner-depuis-usager-externe.mutation'

export const creerOuFusionnerBeneficiairesDepuisUsagersExternesBinding =
  creerOuFusionnerBeneficiairesDepuisUsagersExternes({ communeDeLAdresse })
