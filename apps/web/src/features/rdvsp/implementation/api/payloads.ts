import { z } from 'zod'
import { statutsPresence } from '../../domain/statut-presence'

/**
 * Forme filaire des réponses de RDV Service Public.
 *
 * Ces schémas ne sont pas décoratifs : ils sont la sonde qui transforme une
 * évolution d'API en `ReponseInattendue` explicite, là où un typage `axios<T>`
 * laisse passer un champ disparu sous forme d'`undefined` propagé jusqu'en base.
 * Ils sont volontairement non stricts — Zod ignore les clés inconnues — pour que
 * l'ajout d'un champ côté RDV SP (`city_code`, `notification_email`…) ne casse
 * rien.
 */

const dateExterne = z
  .string()
  .refine((valeur) => !Number.isNaN(Date.parse(valeur)), 'date invalide')
  .transform((valeur) => new Date(valeur))

const dateExterneOptionnelle = z
  .string()
  .nullish()
  .transform((valeur) =>
    valeur == null || Number.isNaN(Date.parse(valeur))
      ? null
      : new Date(valeur),
  )

const texteOptionnel = z
  .string()
  .nullish()
  .transform((valeur) => valeur ?? null)

const booleenOptionnel = z
  .boolean()
  .nullish()
  .transform((valeur) => valeur ?? false)

const statutPresencePayload = z.enum(statutsPresence)

export const agentPayload = z.object({
  id: z.number().int(),
  email: z.string(),
  first_name: z.string(),
  last_name: z.string(),
})

export const mePayload = z.object({ agent: agentPayload })

export const organisationPayload = z.object({
  id: z.number().int(),
  name: z.string(),
  email: texteOptionnel,
  phone_number: texteOptionnel,
  verticale: texteOptionnel,
})

export const usagerPayload = z.object({
  id: z.number().int(),
  first_name: z.string(),
  last_name: z.string(),
  email: texteOptionnel,
  phone_number: texteOptionnel,
  phone_number_formatted: texteOptionnel,
  birth_date: dateExterneOptionnelle,
  address: texteOptionnel,
  address_details: texteOptionnel,
  affiliation_number: texteOptionnel,
  caisse_affiliation: texteOptionnel,
  birth_name: texteOptionnel,
  created_at: dateExterneOptionnelle,
  invitation_created_at: dateExterneOptionnelle,
  invitation_accepted_at: dateExterneOptionnelle,
  responsible_id: z
    .number()
    .int()
    .nullish()
    .transform((valeur) => valeur ?? null),
  notify_by_email: booleenOptionnel,
  notify_by_sms: booleenOptionnel,
})

export const participationPayload = z.object({
  id: z.number().int(),
  status: statutPresencePayload,
  send_reminder_notification: booleenOptionnel,
  send_lifecycle_notifications: booleenOptionnel,
  user: usagerPayload,
})

const motifPayload = z.object({
  id: z.number().int(),
  name: z.string(),
  collectif: booleenOptionnel,
  organisation_id: z.number().int(),
  follow_up: booleenOptionnel,
  instruction_for_rdv: texteOptionnel,
  location_type: texteOptionnel,
  motif_category: z
    .object({ id: z.number().int() })
    .nullish()
    .transform((valeur) => valeur ?? null),
})

const lieuPayload = z.object({
  id: z.number().int(),
  name: z.string(),
  address: texteOptionnel,
  organisation_id: z.number().int(),
  phone_number: texteOptionnel,
  single_use: booleenOptionnel,
})

export const rdvPayload = z.object({
  id: z.number().int(),
  uuid: z.string(),
  address: texteOptionnel,
  starts_at: dateExterne,
  ends_at: dateExterne,
  duration_in_min: z.number().int(),
  status: statutPresencePayload,
  /**
   * Absent du schéma publié — il n'apparaît que dans les exemples de réponse —
   * mais servi et stocké comme obligatoire de notre côté. Le valider ici rend le
   * jour où il disparaîtra immédiatement visible.
   */
  url_for_agents: z.string(),
  users_count: z
    .number()
    .int()
    .nullish()
    .transform((valeur) => valeur ?? 0),
  context: texteOptionnel,
  created_by_id: z
    .number()
    .int()
    .nullish()
    .transform((valeur) => valeur ?? null),
  cancelled_at: dateExterneOptionnelle,
  collectif: z.boolean(),
  name: texteOptionnel,
  max_participants_count: z
    .number()
    .int()
    .nullish()
    .transform((valeur) => valeur ?? null),
  organisation: organisationPayload,
  motif: motifPayload.nullish().transform((valeur) => valeur ?? null),
  lieu: lieuPayload.nullish().transform((valeur) => valeur ?? null),
  participations: z.array(participationPayload).default([]),
})

export const demandeRdvPayload = z.object({
  rdv_plan: z.object({
    id: z.number().int(),
    user_id: z.number().int(),
    url: z.string(),
    rdv: z
      .object({ id: z.number().int() })
      .nullish()
      .transform((valeur) => valeur ?? null),
  }),
})

export const statutRdvPayload = z.object({ status: statutPresencePayload })

export const jetonsPayload = z.object({
  access_token: z.string(),
  refresh_token: texteOptionnel,
  expires_in: z.number(),
  scope: texteOptionnel,
})

/**
 * La pagination est déclarée `string | null` dans la spécification alors que le
 * service renvoie un entier. On accepte les deux plutôt que de parier sur l'un
 * des deux.
 */
const pageSuivante = z
  .union([z.number().int(), z.string()])
  .nullish()
  .transform((valeur) => {
    const page =
      typeof valeur === 'string' ? Number.parseInt(valeur, 10) : valeur
    return typeof page === 'number' && Number.isFinite(page) ? page : null
  })

const metaPayload = z
  .object({ next_page: pageSuivante })
  .nullish()
  .transform((valeur) => valeur ?? { next_page: null })

export const rdvsPagePayload = z.object({
  rdvs: z.array(rdvPayload).default([]),
  meta: metaPayload,
})

export const organisationsPagePayload = z.object({
  organisations: z.array(organisationPayload).default([]),
  meta: metaPayload,
})

export const usagersPagePayload = z.object({
  users: z.array(usagerPayload).default([]),
  meta: metaPayload,
})

export const webhookPayload = z.object({
  id: z.number().int().positive(),
  target_url: z.string(),
  organisation_id: z.number().int().positive(),
  subscriptions: z.array(z.string()).default([]),
})

export const webhooksPagePayload = z.object({
  webhook_endpoints: z.array(webhookPayload).default([]),
  meta: metaPayload,
})

export const webhookUniquePayload = z.object({
  webhook_endpoint: webhookPayload,
})

export const usagerUniquePayload = z.object({
  user: usagerPayload.nullish().transform((valeur) => valeur ?? null),
})

export type AgentPayload = z.infer<typeof agentPayload>
export type OrganisationPayload = z.infer<typeof organisationPayload>
export type UsagerPayload = z.infer<typeof usagerPayload>
export type ParticipationPayload = z.infer<typeof participationPayload>
export type RdvPayload = z.infer<typeof rdvPayload>
export type MotifPayload = z.infer<typeof motifPayload>
export type LieuPayload = z.infer<typeof lieuPayload>
export type DemandeRdvPayload = z.infer<typeof demandeRdvPayload>
export type JetonsPayload = z.infer<typeof jetonsPayload>
export type WebhookPayload = z.infer<typeof webhookPayload>
