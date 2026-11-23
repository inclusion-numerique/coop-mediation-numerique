import { instrument } from '@/configuration/telemetry/instrument/server'
import { communeFieldsFromAddress } from './ban/champs-de-commune-depuis-l-adresse'
import { creerOuFusionnerBeneficiairesDepuisUsagersExternes } from './prisma/creer-ou-fusionner-depuis-usager-externe.mutation'

const communeDeLAdresse = (adresse: string) =>
  instrument(
    { name: 'http.ban.search', service: 'base-adresse-nationale' },
    () => communeFieldsFromAddress(adresse),
  )

export const creerOuFusionnerBeneficiairesDepuisUsagersExternesBinding =
  creerOuFusionnerBeneficiairesDepuisUsagersExternes({ communeDeLAdresse })
