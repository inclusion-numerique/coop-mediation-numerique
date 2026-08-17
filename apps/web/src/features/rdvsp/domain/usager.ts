import type {
  EmailExterne,
  NomExterne,
  PrenomExterne,
  TelephoneExterne,
} from './identite'
import type { UsagerId } from './usager-id'

/**
 * Coordonnées libres transmises par RDV Service Public, sans garantie de forme.
 * Elles sont regroupées ici plutôt que brandées une par une : ce sont des
 * chaînes de saisie que La Coop recopie sans les interpréter, et leur donner un
 * type métier laisserait croire à une validation qui n'existe pas (AR-6).
 */
export type CoordonneesUsager = {
  readonly adresse: string | null
  readonly complementAdresse: string | null
  readonly numeroAllocataire: string | null
  readonly caisseAffiliation: string | null
  readonly nomNaissance: string | null
}

/**
 * Usager RDV Service Public. C'est le pendant externe du bénéficiaire La Coop,
 * auquel il est rattaché par `rdv_users` ; le rapprochement lui-même appartient
 * à la feature bénéficiaire, pas ici.
 *
 * `responsableId` porte la relation « usager mineur rattaché à un adulte » de
 * RDV SP : c'est un identifiant externe, jamais un bénéficiaire La Coop.
 */
export type Usager = {
  readonly id: UsagerId
  readonly prenom: PrenomExterne
  readonly nom: NomExterne
  readonly email: EmailExterne | null
  /** Numéro tel que saisi, et sa forme normalisée par RDV Service Public. */
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
