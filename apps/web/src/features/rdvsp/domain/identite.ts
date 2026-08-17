import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

/**
 * Identité telle que RDV Service Public la porte, pour un agent comme pour un
 * usager. Volontairement dupliquée depuis `features/beneficiaire/domain` plutôt
 * que partagée : une ability de RDV SP ne doit pas dépendre du domaine d'une
 * autre feature (IS-2), et les deux modèles n'ont aucune raison d'évoluer
 * ensemble — celui-ci suit le contrat d'un tiers.
 */
export const PrenomExterne = defineModel(
  z.string().trim().min(1).brand('PrenomExterne'),
)
export type PrenomExterne = Model.TypeOf<typeof PrenomExterne>

export const NomExterne = defineModel(
  z.string().trim().min(1).brand('NomExterne'),
)
export type NomExterne = Model.TypeOf<typeof NomExterne>

export const EmailExterne = defineModel(
  z.string().trim().toLowerCase().email().brand('EmailExterne'),
)
export type EmailExterne = Model.TypeOf<typeof EmailExterne>

/**
 * Numéro de téléphone tel que RDV Service Public le transmet : aucune
 * normalisation E.164 ici. La conversion vers le `Telephone` de La Coop est un
 * choix de la feature qui ingère la donnée, et elle doit pouvoir échouer sans
 * faire tomber la synchronisation entière.
 */
export const TelephoneExterne = defineModel(
  z.string().trim().min(1).brand('TelephoneExterne'),
)
export type TelephoneExterne = Model.TypeOf<typeof TelephoneExterne>
