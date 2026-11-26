import type { UsagerId } from './identifiants/usager-id'
import type {
  EmailExterne,
  NomExterne,
  PrenomExterne,
  TelephoneExterne,
} from './identite'

type CoordonneesUsager = {
  readonly adresse: string | null
  readonly complementAdresse: string | null
  readonly numeroAllocataire: string | null
  readonly caisseAffiliation: string | null
  readonly nomNaissance: string | null
}

export type Usager = {
  readonly id: UsagerId
  readonly prenom: PrenomExterne
  readonly nom: NomExterne
  readonly email: EmailExterne | null
  readonly telephone: TelephoneExterne | null
  readonly telephoneFormate: TelephoneExterne | null
  readonly dateNaissance: Date | null
  readonly creation: Date | null
  readonly invitationCreee: Date | null
  readonly invitationAcceptee: Date | null
  readonly coordonnees: CoordonneesUsager
  readonly responsableId: UsagerId | null
  readonly notifierParEmail: boolean
  readonly notifierParSms: boolean
}
