import {
  OAuthApiRdv,
  RdvApiUser,
} from '@app/web/rdv-service-public/OAuthRdvApiCallInput'

export enum RdvspWebhookModel {
  Rdv = 'Rdv',
  User = 'User',
  Agent = 'Agent',
  UserProfile = 'UserProfile',
}

export type RdvspWebhookEvent = 'created' | 'updated' | 'destroyed'

// Webhook RDV extends the API RDV type but adds the users array
export type RdvspWebhookRdvData = Omit<OAuthApiRdv, 'motif'> & {
  users: RdvApiUser[]
  // In webhooks, motif_category is a string, not an object
  motif: Omit<OAuthApiRdv['motif'], 'motif_category'> & {
    motif_category: string | null
  }
}

export type RdvspWebhookAgentData = {
  id: number
  email: string
  first_name: string
  last_name: string
}

export type RdvspWebhookUserData = {
  id: number
  address: string | null
  address_details: string | null
  affiliation_number: string | null
  birth_date: string | null
  birth_name: string | null
  created_at: string
  email: string | null
  first_name: string
  invitation_accepted_at: string | null
  invitation_created_at: string | null
  last_name: string
  notification_email: string | null
  notify_by_email: boolean
  notify_by_sms: boolean
  phone_number: string
  phone_number_formatted: string | null
  responsible: unknown | null
  responsible_id: number | null
  user_profiles: unknown | null
}

export type RdvspWebhookUserProfileData = {
  organisation: {
    id: number
    email: string | null
    name: string
    phone_number: string | null
    verticale: string
  }
  user: RdvspWebhookUserData
}

// Discriminated union based on model type
export type RdvspWebhookPayload =
  | {
      data: RdvspWebhookRdvData
      meta: {
        model: RdvspWebhookModel.Rdv
        event: RdvspWebhookEvent
        webhook_reason: string | null
        timestamp: string
      }
    }
  | {
      data: RdvspWebhookAgentData
      meta: {
        model: RdvspWebhookModel.Agent
        event: RdvspWebhookEvent
        webhook_reason: string | null
        timestamp: string
      }
    }
  | {
      data: RdvspWebhookUserData
      meta: {
        model: RdvspWebhookModel.User
        event: RdvspWebhookEvent
        webhook_reason: string | null
        timestamp: string
      }
    }
  | {
      data: RdvspWebhookUserProfileData
      meta: {
        model: RdvspWebhookModel.UserProfile
        event: RdvspWebhookEvent
        webhook_reason: string | null
        timestamp: string
      }
    }
