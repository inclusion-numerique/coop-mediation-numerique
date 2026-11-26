import { z } from 'zod'
import { defineModel, type Model } from '@/libraries/model'
import type { RdvId } from '../identifiants/rdv-id'
import type { UsagerId } from '../identifiants/usager-id'
import type {
  EmailExterne,
  NomExterne,
  PrenomExterne,
  TelephoneExterne,
} from '../identite'

export const DemandeRdvId = defineModel(
  z.number().int().positive().brand('DemandeRdvId'),
)
export type DemandeRdvId = Model.TypeOf<typeof DemandeRdvId>

export const UrlPriseRdv = defineModel(z.url().brand('UrlPriseRdv'))
export type UrlPriseRdv = Model.TypeOf<typeof UrlPriseRdv>

export const UrlRetour = defineModel(z.url().brand('UrlRetour'))
export type UrlRetour = Model.TypeOf<typeof UrlRetour>

export type UsagerDeLaDemande =
  | { readonly _tag: 'existant'; readonly id: UsagerId }
  | {
      readonly _tag: 'aCreer'
      readonly prenom: PrenomExterne | null
      readonly nom: NomExterne | null
      readonly email: EmailExterne | null
      readonly telephone: TelephoneExterne | null
      readonly adresse: string | null
      readonly dateNaissance: Date | null
    }

export type DemandeRdv = {
  readonly usager: UsagerDeLaDemande
  readonly urlRetour: UrlRetour | null
  readonly urlDossier: UrlRetour | null
}

export type DemandeRdvCreee = {
  readonly id: DemandeRdvId
  readonly usagerId: UsagerId
  readonly url: UrlPriseRdv
  readonly rdvId: RdvId | null
}
