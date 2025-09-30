import { z } from 'zod'

/**
 * Pour la documentation des API RDV, voir https://rdv.anct.gouv.fr/api-docs/index.html
 */

export type OauthRdvApiMeResponse = {
  agent: {
    id: number
    email: string
    first_name: string
    last_name: string
  }
}

export type RdvApiUserOrganisationProfile = {
  organisation: {
    id: number
    email: string | null
    name: string
    phone_number: string | null
    verticale: string | null
  }
}

export type RdvApiUser = {
  id: number
  address: string | null
  address_details: string | null
  affiliation_number: string | null
  birth_date: string | null
  birth_name: string | null
  caisse_affiliation: 'aucun' | 'caf' | 'msa' | null
  created_at: string
  email: string | null
  first_name: string
  invitation_accepted_at: string | null
  invitation_created_at: string | null
  last_name: string
  notification_email: string | null
  notify_by_email: boolean
  notify_by_sms: boolean
  phone_number: string | null
  phone_number_formatted: string | null
  responsible: RdvApiUser | null
  responsible_id: number | null
  user_profiles: RdvApiUserOrganisationProfile[] | null
}

export type OauthRdvApiGetUserResponse = {
  user: RdvApiUser | null
}

export const OauthRdvApiCreateRdvPlanInputValidation = z.object({
  // 'user' est requis par le contrôleur
  user: z.object({
    id: z.number().optional(), // si on veut passer un user existant
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    email: z.string().email().optional(),
    address: z.string().optional(),
    phone_number: z.string().optional(),
    birth_date: z.string().optional(),
  }),
  // paramètre optionnel utilisé par le contrôleur
  return_url: z.string().url().optional(),
  dossier_url: z.string().url().optional(),
})
export type OauthRdvApiCreateRdvPlanInput = z.infer<
  typeof OauthRdvApiCreateRdvPlanInputValidation
>

export const OauthRdvApiCreateRdvPlanMutationInputValidation = z.object({
  beneficiaireId: z.string().uuid(),
  returnUrl: z.string().url(),
})

// format de la réponse retournée (simplifié, car la blueprint n’est pas visible)
export type OauthRdvApiCreateRdvPlanResponse = {
  rdv_plan: {
    id: number
    created_at: string
    updated_at: string
    user_id: number // le bénéficiaire côté rendez-vous
    url: string // consultation du RDV
    rdv: {
      id: number
      status: string
    } | null
  }
}

export type RdvApiOrganisation = {
  id: number
  email: string | null
  name: string
  phone_number: string | null
  verticale: string | null
}

export type OAuthRdvApiGetOrganisationsResponse = {
  organisations: RdvApiOrganisation[]
}

export type OAuthApiRdvStatus =
  | 'unknown'
  | 'seen'
  | 'noshow'
  | 'excused'
  | 'revoked'

export type OAuthApiParticipation = {
  id: number
  created_by: string
  created_by_agent_prescripteur: boolean
  created_by_id: number
  created_by_type: string
  send_lifecycle_notifications: boolean
  send_reminder_notification: boolean
  status: OAuthApiRdvStatus
  user: RdvApiUser
}

export type OAuthApiRdv = {
  id: number
  uuid: string
  users_count: number
  address: string
  starts_at: string
  status: OAuthApiRdvStatus
  url_for_agents: string
  agents: Array<{
    id: number
    email: string
    first_name: string
    last_name: string
  }>
  cancelled_at: string | null
  collectif: boolean
  context: string | null
  created_at: string
  created_by: string
  created_by_id: number
  created_by_type: string
  duration_in_min: number
  ends_at: string
  lieu: {
    id: number
    address: string
    name: string
    organisation_id: number
    phone_number: string | null
    single_use: boolean
  }
  max_participants_count: number | null
  motif: {
    id: number
    bookable_by: string
    bookable_publicly: boolean
    collectif: boolean
    deleted_at: string | null
    follow_up: boolean
    instruction_for_rdv: string | null
    location_type: string
    motif_category: {
      id: number
      name: string
      short_name: string
    }
    name: string
    organisation_id: number
    service_id: number
  }
  name: string | null
  organisation: RdvApiOrganisation
  participations: OAuthApiParticipation[]
}

export type OAuthApiListMeta = {
  current_page: number
  next_page: string | null
  prev_page: string | null
  total_pages: number
  total_count: number
}

export type OAuthApiOrganisationRdvsResponse = {
  rdvs: OAuthApiRdv[]
  meta: OAuthApiListMeta
}

export type OAuthApiRdvsResponse = {
  rdvs: OAuthApiRdv[]
  meta: OAuthApiListMeta
}

export const oauthRdvApiGetRdvsQueryValidation = z.object({
  page: z.number().int().positive().optional(),
  organisation_id: z.number().int().optional(),
  user_id: z.number().int().optional(),
  agent_id: z.number().int().optional(),
  id: z.union([z.number().int(), z.array(z.number().int())]).optional(),
  starts_after: z.string().optional(),
  starts_before: z.string().optional(),
})

export type OauthRdvApiGetRdvsQuery = z.infer<
  typeof oauthRdvApiGetRdvsQueryValidation
>
