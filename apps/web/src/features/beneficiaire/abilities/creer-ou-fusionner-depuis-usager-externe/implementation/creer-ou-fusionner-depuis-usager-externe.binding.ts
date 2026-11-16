import { communeFieldsFromAddress } from '@app/web/external-apis/ban/communeFieldsFromAddress'
import * as Sentry from '@sentry/nextjs'
import { creerOuFusionnerBeneficiairesDepuisUsagersExternes } from './prisma/creer-ou-fusionner-depuis-usager-externe.mutation'

export const creerOuFusionnerBeneficiairesDepuisUsagersExternesBinding =
  creerOuFusionnerBeneficiairesDepuisUsagersExternes({
    communeDeLAdresse: communeFieldsFromAddress,
    signaler: (erreur) => Sentry.captureException?.(erreur),
  })
