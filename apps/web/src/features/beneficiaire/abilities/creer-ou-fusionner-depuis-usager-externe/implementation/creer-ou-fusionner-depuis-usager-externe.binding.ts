import { communeDeLAdresse } from '@app/web/configuration/ban'
import { creerOuFusionnerBeneficiairesDepuisUsagersExternes } from './prisma/creer-ou-fusionner-depuis-usager-externe.mutation'

export const creerOuFusionnerBeneficiairesDepuisUsagersExternesBinding =
  creerOuFusionnerBeneficiairesDepuisUsagersExternes({ communeDeLAdresse })
