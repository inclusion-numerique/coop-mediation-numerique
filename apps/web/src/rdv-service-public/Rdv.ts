import type { OAuthApiRdvStatus } from './OAuthRdvApiCallInput'
import type { RdvStatus } from './rdvStatus'

// Représente un bénéficiaire suivi côté coop qu'on a lié à un user de RDVSP
export type RdvUserBeneficiaire = {
  id: string
  prenom: string
  nom: string
  mediateurId: string
}

/**
 * Our domain model for reprensenting a list of RDVS owned by OAUTH RDV Service Public
 */
export type Rdv = {
  id: number
  durationInMinutes: number
  date: Date
  endDate: Date
  createdBy: string
  status: OAuthApiRdvStatus
  badgeStatus: RdvStatus
  motif: {
    id: number
    name: string
    collectif: boolean
  }
  name: string | null // useful if motif.collectif is true (nom de l'atelier côté RDV Service Public)
  maxParticipantsCount: number | null // useful if motif.collectif is true
  url: string
  agents: {
    id: number
    firstName: string
    lastName: string
    displayName: string
    email: string
  }[]
  organisation: {
    id: number
    name: string
  }
  participations: {
    id: number
    status: OAuthApiRdvStatus
    sendReminderNotification: boolean
    sendLifecycleNotifications: boolean
    user: {
      id: number
      firstName: string
      lastName: string
      displayName: string
      email: string | null
      beneficiaire: RdvUserBeneficiaire | null // coop uuidv4 du bénéficiaire suivi
    }
  }[]
}
