import { instrument } from '@/configuration/telemetry/serveur'
import { champsDeCommuneDepuisLAdresse } from './ban/champs-de-commune-depuis-l-adresse.transfer'
import { creerOuFusionnerBeneficiairesDepuisUsagersExternes } from './prisma/creer-ou-fusionner-depuis-usager-externe.mutation'

const communeDeLAdresse = (adresse: string) =>
  instrument(
    { name: 'http.ban.search', service: 'base-adresse-nationale' },
    () => champsDeCommuneDepuisLAdresse(adresse),
  )

export const creerOuFusionnerBeneficiairesDepuisUsagersExternesBinding =
  creerOuFusionnerBeneficiairesDepuisUsagersExternes({ communeDeLAdresse })
